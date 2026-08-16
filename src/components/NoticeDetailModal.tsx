import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Heart, 
  Send, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  ThumbsUp, 
  CornerDownRight, 
  Sparkles,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  role?: string;
  timeAgoBn: string;
  timeAgoEn: string;
  textBn: string;
  textEn: string;
  likes: number;
  isLiked?: boolean;
  replies?: {
    id: string;
    author: string;
    avatar: string;
    role?: string;
    timeAgoBn: string;
    timeAgoEn: string;
    textBn: string;
    textEn: string;
    likes: number;
  }[];
}

export interface NoticeArticle {
  id: number;
  categoryBn: string;
  categoryEn: string;
  dateBn: string;
  dateEn: string;
  titleBn: string;
  titleEn: string;
  summaryBn?: string;
  summaryEn?: string;
  contentBn?: string[];
  contentEn?: string[];
  authorBn?: string;
  authorEn?: string;
  initialComments: CommentItem[];
}

interface NoticeDetailModalProps {
  article: NoticeArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isBn: boolean;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  article,
  isOpen,
  onClose,
  isBn
}) => {
  if (!isOpen || !article) return null;

  const [comments, setComments] = useState<CommentItem[]>(article.initialComments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [likedArticles, setLikedArticles] = useState(false);
  const [likesCount, setLikesCount] = useState(42);

  const t = (bn: string, en: string) => (isBn ? bn : en);

  const handleToggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : c.likes - 1
          };
        }
        return c;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `user-${Date.now()}`,
      author: authorName.trim() || t('অতিথি ব্যবহারকারী', 'Guest User'),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (comments.length % 5)}?w=100&auto=format&fit=crop&q=80`,
      role: t('সক্রিয় সদস্য', 'Active Member'),
      timeAgoBn: 'এইমাত্র',
      timeAgoEn: 'Just now',
      textBn: newCommentText.trim(),
      textEn: newCommentText.trim(),
      likes: 1,
      isLiked: true
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
        
        {/* Backdrop click dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="bg-[#ff5e14]/15 text-[#ff5e14] font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                {t(article.categoryBn, article.categoryEn)}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#ff5e14]" />
                {t(article.dateBn, article.dateEn)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-200/70 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
              title={t('বন্ধ করুন', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
            
            {/* Notice Title & Meta */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {t(article.titleBn, article.titleEn)}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 pb-3 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff5e14] to-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    HK
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {article.authorBn ? t(article.authorBn, article.authorEn || '') : t('হাতের কাছে অ্যাডমিন ডেক্স', 'HaterKache Editorial')}
                    </span>
                    <span className="text-[10px] text-[#ff5e14] block font-semibold">
                      {t('যাচাইকৃত অফিসিয়াল আপডেট', 'Verified Official Update')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLikedArticles(!likedArticles);
                      setLikesCount((prev) => (likedArticles ? prev - 1 : prev + 1));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      likedArticles
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedArticles ? 'fill-rose-500' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert(t('নোটিশ লিঙ্ক কপি করা হয়েছে!', 'Notice link copied to clipboard!'));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#ff5e14] text-xs font-bold transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('শেয়ার', 'Share')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notice Detailed Paragraphs */}
            <div className="space-y-3.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/5">
              {article.contentBn && article.contentBn.length > 0 ? (
                (isBn ? article.contentBn : (article.contentEn || article.contentBn)).map((p, i) => (
                  <p key={i} className="text-justify">{p}</p>
                ))
              ) : (
                <p>
                  {t(
                    'হাতের কাছে পোর্টালে এই নোটিশটি সক্রিয়ভাবে পর্যবেক্ষণ করা হচ্ছে। ব্যবহারকারীদের সুবিধার্থে নিয়মিত নতুন তথ্য ও দিকনির্দেশনা আপডেট করা হবে।',
                    'This notice is actively monitored on HaterKache portal. Further official instructions and guidance will be updated regularly.'
                  )}
                </p>
              )}
            </div>

            {/* Comments & Discussion Section Header */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#ff5e14]" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {t('মন্তব্য ও প্রশ্নোত্তর', 'Discussion & Comments')}
                  </h3>
                  <span className="bg-[#ff5e14]/15 text-[#ff5e14] font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {t('লাইভ প্রতিক্রিয়া', 'Community Feed')}
                </span>
              </div>

              {/* Add New Comment Box */}
              <form onSubmit={handleAddComment} className="bg-slate-100 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-1/3">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder={t('আপনার নাম (ঐচ্ছিক)', 'Your Name (Optional)')}
                      className="w-full bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#ff5e14]"
                    />
                  </div>
                  <div className="flex-1 w-full text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff5e14]" />
                    <span>{t('আপনার মতামত বা প্রশ্ন লিখুন:', 'Leave your helpful thought or feedback:')}</span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={t('এখানে আপনার মন্তব্য লিখুন...', 'Write your comment here...')}
                    required
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-white/10 focus:outline-none focus:border-[#ff5e14] transition-colors resize-none placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 bottom-3.5 bg-[#ff5e14] hover:bg-[#e04f0d] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <span>{t('পোস্ট', 'Post')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-white/15"
                  >
                    {/* Comment Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#ff5e14]/40"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {comment.author}
                            </span>
                            {comment.role && (
                              <span className="text-[10px] bg-sky-500/10 text-sky-400 font-bold px-1.5 py-0.2 rounded border border-sky-500/20">
                                {comment.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t(comment.timeAgoBn, comment.timeAgoEn)}
                          </span>
                        </div>
                      </div>

                      {/* Like Reaction Button */}
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          comment.isLiked
                            ? 'bg-rose-500/15 text-rose-500 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes}</span>
                      </button>
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 pl-10 leading-relaxed">
                      {t(comment.textBn, comment.textEn)}
                    </p>

                    {/* Nested Replies if any */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-8 pt-2 space-y-2">
                        {comment.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-white/5 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-3.5 h-3.5 text-[#ff5e14]" />
                                <img
                                  src={rep.avatar}
                                  alt={rep.author}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                                  {rep.author}
                                </span>
                                {rep.role && (
                                  <span className="text-[9px] bg-orange-500/10 text-[#ff5e14] font-bold px-1 rounded">
                                    {rep.role}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {t(rep.timeAgoBn, rep.timeAgoEn)}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 pl-6 text-[11px] leading-relaxed">
                              {t(rep.textBn, rep.textEn)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('হাতের কাছে ডিজিটাল হেল্পডেস্ক', 'HaterKache Verified Feed')}</span>
            </span>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
            >
              {t('বন্ধ করুন', 'Close')}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
