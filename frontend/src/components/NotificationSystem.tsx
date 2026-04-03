import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ position = 'top-right' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Function to add notifications (can be called from anywhere in the app)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 5 seconds for success/info, 7 seconds for warnings/errors
    const timeout = notification.type === 'success' || notification.type === 'info' ? 5000 : 7000;
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, timeout);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Production: no demo simulation. Real notifications should be pushed
  // from the backend or triggered by application events.
  useEffect(() => {
    return () => {};
  }, []);

  const getPositionStyle = () => {
    const base = { position: 'fixed' as const, zIndex: 9999, maxWidth: '400px' };
    switch (position) {
      case 'top-right':
        return { ...base, top: '20px', right: '20px' };
      case 'top-left':
        return { ...base, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...base, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...base, bottom: '20px', left: '20px' };
      default:
        return { ...base, top: '20px', right: '20px' };
    }
  };

  const getNotificationStyle = (type: string) => {
    const baseStyle = {
      backgroundColor: '#141921',
      border: '1px solid',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      animation: 'slideIn 0.3s ease-out',
      cursor: 'pointer',
      minWidth: '320px'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, borderColor: 'rgba(0, 212, 168, 0.5)', backgroundColor: 'rgba(0, 212, 168, 0.05)' };
      case 'warning':
        return { ...baseStyle, borderColor: 'rgba(255, 209, 102, 0.5)', backgroundColor: 'rgba(255, 209, 102, 0.05)' };
      case 'error':
        return { ...baseStyle, borderColor: 'rgba(255, 107, 107, 0.5)', backgroundColor: 'rgba(255, 107, 107, 0.05)' };
      case 'info':
        return { ...baseStyle, borderColor: 'rgba(76, 201, 240, 0.5)', backgroundColor: 'rgba(76, 201, 240, 0.05)' };
      default:
        return baseStyle;
    }
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: '#00d4a8' };
      case 'warning':
        return { icon: '⚠️', color: '#ffd166' };
      case 'error':
        return { icon: '❌', color: '#ff6b6b' };
      case 'info':
        return { icon: 'ℹ️', color: '#4cc9f0' };
      default:
        return { icon: '📢', color: '#9ca3af' };
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification-enter {
          animation: slideIn 0.3s ease-out;
        }

        .notification:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>

      <div style={getPositionStyle()}>
        {notifications.map((notification) => {
          const { icon, color } = getIconAndColor(notification.type);
          return (
            <div
              key={notification.id}
              className="notification notification-enter"
              style={getNotificationStyle(notification.type)}
              onClick={() => removeNotification(notification.id)}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  <span style={{ color, fontSize: '14px', fontWeight: 600 }}>
                    {notification.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {notification.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '0',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Message */}
              <div style={{
                color: '#e5e7eb',
                fontSize: '13px',
                lineHeight: 1.4,
                marginBottom: notification.actions ? '12px' : '0'
              }}>
                {notification.message}
              </div>

              {/* Actions */}
              {notification.actions && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.action();
                        removeNotification(notification.id);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: action.style === 'primary' ? color : 'transparent',
                        color: action.style === 'primary' ? '#000' : color,
                        border: action.style === 'secondary' ? `1px solid ${color}` : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (action.style === 'primary') {
                          e.currentTarget.style.opacity = '0.8';
                        } else {
                          e.currentTarget.style.backgroundColor = `${color}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (action.style === 'primary') {
                          e.currentTarget.style.opacity = '1';
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default NotificationSystem;