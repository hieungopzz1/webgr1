import React, { useState, useEffect, useCallback } from 'react';
import { getUserData } from '../../utils/storage';
import api from '../../utils/api';
import './CommentList.css';
import { RiReplyLine, RiDeleteBin6Line, RiEdit2Line } from 'react-icons/ri';
import Button from '../button/Button';
import InputField from '../inputField/InputField';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

const CommentItem = ({ 
  comment, 
  replies, 
  onReply, 
  onDelete, 
  onUpdate,
  currentUser,
  level = 0 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const author = comment.student_id || comment.tutor_id;
  const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown User';
  const authorAvatar = author?.avatar
    ? `http://localhost:5001${author.avatar}`
    : "/default-avatar.png";
  
  const isAuthor = currentUser && 
    ((comment.student_id && currentUser.id === comment.student_id._id) || 
     (comment.tutor_id && currentUser.id === comment.tutor_id._id));

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    onReply(comment._id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    onUpdate(comment._id, editContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(comment._id);
    setShowDeleteModal(false);
  };

  const nestedReplies = replies.filter(reply => reply.parent_comment_id === comment._id);

  return (
    <div className={`comment-item ${level > 0 ? 'comment-reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          <img src={authorAvatar} alt={authorName} className="comment-avatar" />
          <div className="comment-author-info">
            <div className="comment-author-name">{authorName}</div>
            <div className="comment-timestamp">
              {new Date(comment.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="comment-actions">
            <button onClick={() => setIsEditing(true)} className="comment-action-btn" title="Edit">
              <RiEdit2Line />
            </button>
            <button onClick={handleDelete} className="comment-action-btn" title="Delete">
              <RiDeleteBin6Line />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateSubmit} className="comment-edit-form">
          <InputField
            multiline
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Edit your comment..."
            fullWidth
          />
          <div className="comment-form-actions">
            <Button 
              type="button" 
              variant="secondary" 
              size="small"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              size="small"
            >
              Update
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="comment-content">{comment.content}</div>
          
          <div className="comment-footer">
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)} 
              className="comment-reply-btn"
            >
              <RiReplyLine /> Reply
            </button>
          </div>
          
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="comment-reply-form">
              <InputField
                multiline
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                fullWidth
              />
              <div className="comment-form-actions">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="small"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="small"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      {nestedReplies.length > 0 && (
        <div className="comment-replies">
          {nestedReplies.map(reply => (
            <CommentItem 
              key={reply._id}
              comment={reply}
              replies={replies}
              onReply={onReply}
              onDelete={onDelete}
              onUpdate={onUpdate}
              currentUser={currentUser}
              level={level + 1}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
};

const CommentList = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  // Get user information from localStorage
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData);
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!blogId) return;
    
    try {
      setLoading(true);
      // Use the newly created endpoint
      const commentsResponse = await api.get(`/api/blog/${blogId}/comments`);
      if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
        setComments(commentsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      
      const userIdField = currentUser.role === 'Student' ? 'student_id' : 'tutor_id';
      
      const response = await api.post('/api/blog/create-comment', {
        blog_id: blogId,
        [userIdField]: currentUser.id,
        content: newComment
      });
      
      if (response.data && response.data.comment) {
        // Update comments list
        setComments(prev => [...prev, response.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    if (!content.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      
      const userIdField = currentUser.role === 'Student' ? 'student_id' : 'tutor_id';
      
      const response = await api.post('/api/blog/create-comment', {
        blog_id: blogId,
        parent_comment_id: parentCommentId,
        [userIdField]: currentUser.id,
        content
      });
      
      if (response.data && response.data.comment) {
        // Update comments list
        setComments(prev => [...prev, response.data.comment]);
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setLoading(true);
      
      await api.delete(`/api/blog/delete-comment/${commentId}`);
      
      // Remove comment from state
      setComments(prev => prev.filter(c => c._id !== commentId && c.parent_comment_id !== commentId));
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (commentId, content) => {
    if (!content.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await api.put(`/api/blog/update-comment/${commentId}`, {
        content
      });
      
      if (response.data && response.data.updatedComment) {
        // Update comment in state
        setComments(prev => 
          prev.map(c => c._id === commentId ? response.data.updatedComment : c)
        );
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Separate root comments and replies
  const rootComments = comments.filter(comment => !comment.parent_comment_id);

  return (
    <div className="comment-list-container">
      <h3 className="comment-section-title">Comments ({comments.length})</h3>
      
      {error && (
        <div className="comment-error-message">{error}</div>
      )}
      
      {currentUser ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <InputField
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            fullWidth
          />
          <Button 
            type="submit" 
            variant="primary"
            disabled={!newComment.trim() || loading}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="comment-login-message">
          Please log in to leave a comment.
        </div>
      )}
      
      {loading && comments.length === 0 ? (
        <div className="comment-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="comment-list">
          {rootComments.map(comment => (
            <CommentItem 
              key={comment._id}
              comment={comment}
              replies={comments}
              onReply={handleReply}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList; 