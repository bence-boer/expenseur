import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { session, supabase } from '../../supabase/auth.middleware.ts';
import { avatar_upload_validator } from '../utils/validators.ts';
import { compress_image } from '../utils/files.ts';

const app = new Hono()
    .get('/', async (context: Context) => {
        const { data, error } = await supabase(context).auth.getUser();

        if (error) {
            console.error('Error fetching user data:', error);
            throw new HTTPException(500, { message: 'Failed to fetch user data' });
        }

        return context.json(data.user, 200);
    })
    .get('/avatar', async (context: Context) => {
        const user_id = session(context)!.user.id;
        const file_path = `${user_id}/avatar`;

        const { data: list_data, error: list_error } = await supabase(context).storage
            .from('avatars')
            .list(user_id, { limit: 1, search: 'avatar' });

        if (list_error) {
            console.error('Error listing avatar:', list_error);
            throw new HTTPException(500, { message: 'Failed to check avatar existence' });
        }

        if (!list_data || list_data.length === 0) {
            return context.json({ signedUrl: null }, 200);
        }

        const { data, error } = await supabase(context).storage
            .from('avatars')
            .createSignedUrl(file_path, 60 * 5);

        if (error) {
            console.error('Error creating signed URL:', error);
            if (error.message.includes('Object not found')) {
                return context.json({ signedUrl: null }, 200);
            }
            throw new HTTPException(500, { message: 'Failed to create signed URL' });
        }
        return context.json(data, 200);
    })
    .put('/avatar', zValidator('form', avatar_upload_validator), async (context: Context) => {
        const user_id = session(context)!.user.id;
        let { avatar } = context.req.valid('form' as any as never) as { avatar: File };
        avatar = await compress_image(avatar, 20);
        const file_path = `${user_id}/avatar`;

        const { data, error } = await supabase(context).storage
            .from('avatars')
            .upload(file_path, avatar, {
                cacheControl: '3600',
                upsert: true,
                contentType: avatar.type,
            });

        if (error) {
            console.error('Error uploading avatar:', error);
            throw new HTTPException(500, { message: `Failed to upload avatar: ${error.message}` });
        }

        return context.json({ path: data.path }, 200);
    })
    .delete('/avatar', async (context: Context) => {
        const user_id = session(context)!.user.id;

        const { data: list_data, error: list_error } = await supabase(context).storage
            .from('avatars')
            .list(user_id, { limit: 1, search: 'avatar' });

        if (list_error) {
            console.error('Error listing avatar for deletion:', list_error);
            throw new HTTPException(500, { message: 'Failed to find avatar for deletion' });
        }

        if (!list_data || list_data.length === 0) {
            return context.body(null, 204);
        }

        const full_file_path = `${user_id}/${list_data[0].name}`;
        const { error } = await supabase(context).storage.from('avatars').remove([full_file_path]);

        if (error) {
            console.error('Error deleting avatar:', error);
            throw new HTTPException(500, { message: `Failed to delete avatar: ${error.message}` });
        }
        return context.body(null, 204);
    });

export default app;
