import React from 'react';

interface NotificationProps {
  message: string;
  estado: string;
}
const Notification: React.FC<NotificationProps> = ({ message, estado }) => {
  return (
    <div
      className={`toast toast-end w-80 transition-opacity duration-500 ${
        message ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={'alert ' + estado}>
        <span>{message}</span>
        <span></span>
      </div>
    </div>
  );
};

export default Notification;
