import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getConversations, getMentorConversationCacheKey } from '../../../services/mentorService';

const MentorConversations = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.user_id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const lastKey = `fgpt_mentor_last_conversation_${userId || 'anon'}`;
    const lastId = localStorage.getItem(lastKey);
    if (lastId) {
      navigate(`/dashboard/mentor/messages/${lastId}`, { replace: true });
      return;
    }

    const cachedRaw = localStorage.getItem(getMentorConversationCacheKey(userId));
    if (cachedRaw) {
      try {
        const parsed = JSON.parse(cachedRaw);
        const first = Array.isArray(parsed) ? parsed[0] : null;
        const id = first?.conversation_id;
        if (id) {
          navigate(`/dashboard/mentor/messages/${id}`, { replace: true });
          return;
        }
      } catch {
        // ignore
      }
    }

    (async () => {
      try {
        const data = await getConversations(userId);
        const first = (Array.isArray(data) ? data : []).find((c) => c?.conversation_id);
        if (first?.conversation_id) {
          navigate(`/dashboard/mentor/messages/${first.conversation_id}`, { replace: true });
          return;
        }
      } catch {
        // ignore
      }

      navigate('/dashboard/mentor/messages/new', { replace: true });
    })();
  }, [userId]);

  return null;
};

export default MentorConversations;
