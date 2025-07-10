import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  UserCircle, 
  Upload, 
  Edit3, 
  Music, 
  Heart, 
  Download, 
  ListMusic, 
  Calendar,
  Camera,
  Save,
  X
} from 'lucide-react';
import { getBackendURL } from '../utils/authFetch';

const Profile = () => {
  //const [user, setUser] = useState(null);
  const { token, user, setUser } = useContext(AuthContext);

  const [newUsername, setNewUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [backendURL, setBackendURL] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = await getBackendURL();
        setBackendURL(url);

        if (!token) return;

        // Fetch user data
        const userRes = await axios.get(`${url}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userRes.data);
        setNewUsername(userRes.data.username);

        // Fetch stats
        const statsRes = await axios.get(`${url}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, setUser]);

  const updateUsername = async () => {
    if (!backendURL) return;
    try {
      await axios.put(`${backendURL}/api/auth/me/username`, { username: newUsername }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, username: newUsername });
      setIsEditingUsername(false);
      alert('Username updated!');
    } catch (error) {
      console.error('Username update failed:', error);
    }
  };

  const uploadAvatar = async () => {
    if (!backendURL || !avatar) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const res = await axios.post(`${backendURL}/api/auth/me/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser((prev) => ({ ...prev, profile_picture: res.data.filename }));
      setAvatar(null);

      alert('Avatar uploaded!');
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-6 pt-20">
          <div className="animate-pulse">
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-slate-300 dark:bg-zinc-700 rounded-full mb-4" />
              <div className="h-6 bg-slate-300 dark:bg-zinc-700 rounded w-48 mb-2" />
              <div className="h-4 bg-slate-300 dark:bg-zinc-700 rounded w-32" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-300 dark:bg-zinc-700 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            {user?.profile_picture ? (
              <img
                src={`${BACKEND_URL}/media/${user.profile_picture}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white dark:border-zinc-700 shadow-lg">
                <UserCircle className="text-white w-20 h-20" />
              </div>
            )}
            
            {/* Avatar Upload Button */}
            <div className="absolute -bottom-2 -right-2">
              <label className="flex items-center justify-center w-10 h-10 bg-white dark:bg-zinc-800 rounded-full shadow-lg border-2 border-purple-500 cursor-pointer hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-purple-500" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          {avatar && (
            <button
              onClick={uploadAvatar}
              disabled={uploadingAvatar}
              className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Avatar
                </>
              )}
            </button>
          )}

          {/* Username Section */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {isEditingUsername ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b-2 border-purple-500 text-slate-800 dark:text-white focus:outline-none text-center"
                />
                <button
                  onClick={updateUsername}
                  className="text-green-500 hover:text-green-600 transition-colors"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingUsername(false);
                    setNewUsername(user?.username || '');
                  }}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  {user?.username}
                </h1>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-purple-500 hover:text-purple-600 transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400">Music Enthusiast</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatNumber(stats.totalDownloads)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Downloads</p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-red-500" />
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatNumber(stats.totalFavorites)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Favorites</p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <ListMusic className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {formatNumber(stats.totalPlaylists)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Playlists</p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <Music className="w-8 h-8 text-green-500" />
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-800 dark:text-white block">
                    {stats.topArtist || 'N/A'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Top Artist</p>
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        {stats && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-slate-200 dark:border-zinc-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                Music Journey
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {stats.firstDownload ? new Date(stats.firstDownload).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Music Level</p>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {stats.totalDownloads > 100 ? 'Expert' : stats.totalDownloads > 50 ? 'Intermediate' : 'Beginner'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;