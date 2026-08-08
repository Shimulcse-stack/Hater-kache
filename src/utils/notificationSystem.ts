export interface CustomNotificationPayload {
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  type?: 'info' | 'update' | 'alert' | 'timer' | 'app';
}

export const dispatchAppNotification = (payload: CustomNotificationPayload) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('hk_notification_dispatch', { detail: payload });
    window.dispatchEvent(event);
  }
};
