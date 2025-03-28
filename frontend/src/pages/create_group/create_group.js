import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, fetchUsers } from '../../api';
import { toast } from 'react-toastify';
import './create_group.css';

const Create_group = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('Fetching users...');
        const fetchedUsers = await fetchUsers();
        console.log('Fetched users:', fetchedUsers);
        console.log('Type of fetchedUsers:', typeof fetchedUsers);
        console.log('Is fetchedUsers an array?', Array.isArray(fetchedUsers));

        // Extract the users array from the response object
        const usersArray = fetchedUsers.users || []; // Use the 'users' property, fallback to empty array if not present
        console.log('Extracted users array:', usersArray);
        console.log('Type of usersArray:', typeof usersArray);
        console.log('Is usersArray an array?', Array.isArray(usersArray));

        setUsers(usersArray);
        console.log('Users state after setUsers:', usersArray);
        setFilteredUsers(usersArray);
        console.log('FilteredUsers state after setFilteredUsers:', usersArray);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setUsers([]); // Fallback to empty array on error
        setFilteredUsers([]);
        console.log('Users state after error:', []);
        console.log('FilteredUsers state after error:', []);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    console.log('Search term changed:', searchTerm);
    console.log('Current members:', members);
    console.log('All users:', users);
    console.log('Type of users:', typeof users);
    console.log('Is users an array?', Array.isArray(users));
    if (searchTerm) {
      if (!Array.isArray(users)) {
        console.error('Users is not an array, cannot filter:', users);
        setFilteredUsers([]);
        return;
      }
      // Fix: Compare user IDs with members array
      let filtered_users = users.filter(item => !members.includes(item.id));
      const filtered = filtered_users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Filtered users:', filtered);
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted with:', { name, description, members });

    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (members.length < 2) {
      toast.error('Add at least 2 members to your group');
      return;
    }

    setIsLoading(true);

    try {
      const newGroup = await createGroup({
        name,
        description,
        members
      });
      console.log('Group created:', newGroup);
      toast.success('Coffee group created successfully!');
      navigate(`/groups/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const addMember = (user) => {
    console.log('Adding member:', user);
    if (!members.includes(user.id)) {
      setMembers([...members, user.id]);
      console.log('Updated members:', [...members, user.id]);
    } else {
      console.log('Member already exists:', user.id);
    }
    setSearchTerm('');
  };

  const removeMember = (userId) => {
    console.log('Removing member:', userId);
    setMembers(members.filter(id => id !== userId));
    console.log('Updated members after removal:', members.filter(id => id !== userId));
  };

  const getUserById = (userId) => {
    const user = users.find(user => user.id === userId);
    console.log('Getting user by ID:', userId, 'Found:', user);
    return user;
  };

  // Rest of the component remains unchanged...
  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Coffee Group</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name">Group Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Office Coffee Crew"
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Daily coffee run after lunch"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label>Add Members</label>
          <div className="member-selection">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for members..."
            />

            {searchTerm && (
              <div className="member-list">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="member-item"
                      onClick={() => addMember(user)}
                    >
                      <span>{user.name}</span>
                      <button type="button" className="add-button">+ Add</button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center">No users found</div>
                )}
              </div>
            )}
          </div>

          <div className="selected-members">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Selected Members ({members.length})
            </div>
            {members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {members.map(memberId => {
                  const user = getUserById(memberId);
                  return user ? (
                    <div key={memberId} className="member-tag">
                      <span className="member-name"> {user.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMember(memberId)}
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No members selected yet. Add at least 2 members.</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 btn-group">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || members.length < 2}
            className="submit-button"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create_group;