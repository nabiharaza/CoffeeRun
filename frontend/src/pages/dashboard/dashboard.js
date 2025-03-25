import React, { useEffect, useState } from 'react';
import { fetchGroups } from '../../api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './dashboard.css';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchGroups();
        console.log('Fetched groups:', fetchedGroups); // Log the raw data
        setGroups(fetchedGroups || []);
        console.log('Set groups state:', fetchedGroups || []); // Log the state
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups');
        setGroups([]);
      } finally {
        setIsLoading(false);
        console.log('isLoading set to false'); // Log the loading state
      }
    };

    loadGroups();
  }, []);

  // Generate initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get random coffee-themed colors for avatars
  const getCoffeeColor = (index) => {
    const coffeeColors = [
      '#8B5A2B', '#A52A2A', '#D2691E',
      '#CD853F', '#A0522D', '#6F4E37'
    ];
    return coffeeColors[index % coffeeColors.length];
  };

  console.log('Rendering Dashboard, groups:', groups, 'isLoading:', isLoading); // Log before rendering

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header-area">
          <h1 className="dashboard-header">My Groups</h1>

          {/* Create Group Button */}
          <Link to="/groups/new" className="create-group-btn">
            <span className="icon-plus">+</span>
            <span>Create New Group</span>
          </Link>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="loading-spinner">
            <div></div>
          </div>
        ) : groups.length > 0 ? (
          <div className="groups-grid">
            {groups.map(group => (
              <Link to={`/groups/${group.id}`} key={group.id} className="group-card">
                <div className="group-card-content">
                  <h2 className="group-card-title">{group.name}</h2>
                  <p className="group-card-description">{group.description || 'No description'}</p>

                  <div className="group-card-members">
                    <div className="members-avatars">
                      {/* Display up to 3 member avatars */}
                      {(group.members || []).slice(0, 3).map((member, index) => (
                        <div
                          className="avatar"
                          key={member.id || index}
                          style={{ backgroundColor: getCoffeeColor(index) }}
                        >
                          {getInitials(member.name || `Member ${index + 1}`)}
                        </div>
                      ))}

                      {/* Show more avatar if there are more than 3 members */}
                      {(group.members || []).length > 3 && (
                        <div className="avatar" style={{ backgroundColor: '#5D4037' }}>
                          +{(group.members || []).length - 3}
                        </div>
                      )}
                    </div>
                    <span className="members-count">
                      {(group.members || []).length || group.member_count || 0} members
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-groups-message">
            <p>No groups found. Create a new group to get started!</p>
            <Link to="/groups/new" className="create-group-btn">
              <span className="icon-plus">+</span>
              <span>Create New Group</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;