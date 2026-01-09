import { supabase } from './supabaseClient';

/**
 * Creates a new thread for the current user.
 * @param {string} title - The title/first query of the thread.
 * @returns {Promise<Object>} The created thread object.
 */
export const createThread = async (title) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // GUEST MODE: Return ephemeral thread object
        if (!user) {
            console.log('Guest User: Creating ephemeral thread');
            return {
                id: 'guest_' + Date.now(),
                user_id: 'guest',
                title: title,
                created_at: new Date().toISOString()
            };
        }

        const { data, error } = await supabase
            .from('threads')
            .insert([{ user_id: user.id, title: title }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating thread:', error);
        // Fallback for any error to allow UI to proceed
        return {
            id: 'guest_fallback_' + Date.now(),
            title: title
        };
    }
};

/**
 * Adds a message to a thread.
 * @param {string} threadId - The ID of the thread.
 * @param {string} role - 'user' or 'assistant'.
 * @param {string} content - The text content.
 * @param {Object} sources - Optional, JSON object of sources.
 * @returns {Promise<Object>} The created message object.
 */
export const addMessage = async (threadId, role, content, sources = null) => {
    try {
        // GUEST MODE: Skip DB insert
        if (threadId && threadId.toString().startsWith('guest_')) {
            return true;
        }

        const { error } = await supabase
            .from('messages')
            .insert([{
                thread_id: threadId,
                role: role,
                content: content,
                sources: sources
            }]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding message:', error);
        return false;
    }
};

/**
 * Fetches user's history (recent threads).
 * @returns {Promise<Array>} List of threads.
 */
export const getHistory = async () => {
    try {
        const { data, error } = await supabase
            .from('threads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
};
