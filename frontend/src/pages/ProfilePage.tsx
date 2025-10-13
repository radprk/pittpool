import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    role: user?.role || 'RIDER',
    vehicleMake: user?.vehicleMake || '',
    vehicleModel: user?.vehicleModel || '',
    vehicleYear: user?.vehicleYear || '',
    licensePlate: user?.licensePlate || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="card mb-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center justify-center space-x-4 mt-3">
            <span className="text-lg">⭐ {user.rating.toFixed(1)}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">{user.totalRides} rides</span>
            <span className="text-gray-600">•</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              user.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
              user.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user.verificationStatus}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {!editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{user.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <p className="text-gray-900">{user.role}</p>
            </div>

            {(user.role === 'DRIVER' || user.role === 'BOTH') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <p className="text-gray-900">
                    {user.vehicleMake && user.vehicleModel
                      ? `${user.vehicleMake} ${user.vehicleModel} ${user.vehicleYear || ''}`
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate
                  </label>
                  <p className="text-gray-900">{user.licensePlate || 'Not set'}</p>
                </div>
              </>
            )}

            <button
              onClick={() => setEditing(true)}
              className="w-full btn-primary"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="RIDER">Rider</option>
                <option value="DRIVER">Driver</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            {(formData.role === 'DRIVER' || formData.role === 'BOTH') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Make
                  </label>
                  <input
                    type="text"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Camry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Year
                  </label>
                  <input
                    type="number"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. 2020"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. ABC1234"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;

