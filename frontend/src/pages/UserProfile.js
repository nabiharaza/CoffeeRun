import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../api';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUser(userId);
        setUser(userData);
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // Function to render the avatar based on type
  const renderAvatar = () => {
    if (!user || !user.avatar) return null;

    if (user.avatar.type === 'initials') {
      return (
        <div className="avatar-circle">
          {user.avatar.value}
        </div>
      );
    } else {
      return (
        <div className="avatar-image">
          <img src={user.avatar.value} alt={`${user.name}'s avatar`} />
        </div>
      );
    }
  };

  return (
    <div className="fade-in">
      <h1>User Profile</h1>
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user data...</p>
        </div>
      ) : (
        <div className="card">
          <div className="profile-header">
            {renderAvatar()}
            <h2>{user?.name}</h2>
          </div>

          <div className="profile-details">
            <div className="profile-item">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user?.email || 'Not provided'}</span>
            </div>

            <div className="profile-item">
              <span className="profile-label">Phone:</span>
              <span className="profile-value">{user?.phone || 'Not provided'}</span>
            </div>

            {user?.groups && user.groups.length > 0 && (
              <div className="profile-item">
                <span className="profile-label">Groups:</span>
                <div className="profile-groups">
                  {user.groups.map(group => (
                    <span key={group.id} className="group-tag">{group.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;