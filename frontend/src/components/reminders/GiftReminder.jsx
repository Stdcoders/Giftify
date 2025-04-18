import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast } from 'sonner';
import { FaGift, FaTrash, FaEdit, FaBell, FaEnvelope } from 'react-icons/fa';
import {
    fetchReminders,
    addReminder,
    updateReminder,
    deleteReminder,
} from '../../redux/slice/reminderSlice';
import { logout } from '../../redux/slice/authSlice';
import { handleAuthError, requireAuth } from '../../utils/authErrorHandler';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const GiftReminder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { reminders, loading, error } = useSelector((state) => state.reminders);
    const { userInfo } = useSelector((state) => state.auth);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date(),
        notifyBefore: 7, // days before to notify
    });

    useEffect(() => {
        // Check if user is logged in
        if (!requireAuth(userInfo, toast, navigate)) return;

        const fetchData = async () => {
            try {
                await dispatch(fetchReminders()).unwrap();
            } catch (err) {
                console.error('Error fetching reminders:', err);

                // Use centralized auth error handling
                if (!handleAuthError(err, dispatch, navigate)) {
                    // Only handle other errors if it's not an auth error
                    const errorMessage = err && err.message ? err.message : 'Error loading reminders';
                    toast.error(errorMessage);
                }
            }
        };

        fetchData();
    }, [dispatch, navigate, userInfo]);

    // Memoize the reminder dates for better calendar performance
    const reminderDates = useMemo(() => {
        if (!reminders.length) return new Set();
        return new Set(reminders.map(reminder =>
            new Date(reminder.date).toDateString()
        ));
    }, [reminders]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const existingReminder = reminders.find(
            (r) => new Date(r.date).toDateString() === date.toDateString()
        );
        if (existingReminder) {
            setEditingReminder(existingReminder);
            setFormData({
                title: existingReminder.title,
                description: existingReminder.description,
                date: new Date(existingReminder.date),
                notifyBefore: existingReminder.notifyBefore,
            });
        } else {
            setEditingReminder(null);
            setFormData({
                title: '',
                description: '',
                date: date,
                notifyBefore: 7,
            });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReminder) {
                await dispatch(
                    updateReminder({ id: editingReminder._id, reminderData: formData })
                ).unwrap();
                toast.success('Reminder updated successfully');
            } else {
                await dispatch(addReminder(formData)).unwrap();
                toast.success('Reminder added successfully');
            }
            setShowForm(false);
            setEditingReminder(null);
            setFormData({
                title: '',
                description: '',
                date: new Date(),
                notifyBefore: 7,
            });
        } catch (err) {
            console.error('Error handling reminder:', err);

            // Use centralized auth error handling
            if (!handleAuthError(err, dispatch, navigate)) {
                // Only handle other errors if it's not an auth error
                const errorMessage = err && err.message ? err.message : 'Failed to save reminder';
                toast.error(errorMessage);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            try {
                await dispatch(deleteReminder(id)).unwrap();
                toast.success('Reminder deleted successfully');
                setShowForm(false);
                setEditingReminder(null);
            } catch (err) {
                console.error('Error deleting reminder:', err);

                // Use centralized auth error handling
                if (!handleAuthError(err, dispatch, navigate)) {
                    // Only handle other errors if it's not an auth error
                    const errorMessage = err && err.message ? err.message : 'Failed to delete reminder';
                    toast.error(errorMessage);
                }
            }
        }
    };

    const handleTestEmail = async () => {
        if (!userInfo || userInfo.role !== 'Admin') {
            toast.error('Only administrators can send test emails');
            return;
        }

        try {
            const userToken = localStorage.getItem('userToken');

            if (!userToken) {
                toast.error('Authentication required. Please log in again.');
                dispatch(logout());
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            await axios.post(`${API_URL}/api/reminders/test-email`, {}, config);
            toast.success('Test notification email sent successfully!');
        } catch (error) {
            console.error('Error sending test email:', error);

            // Use centralized auth error handling
            if (!handleAuthError(error, dispatch, navigate)) {
                // Only handle other errors if it's not an auth error
                const errorMessage = error && error.response && error.response.data ?
                    error.response.data.message : 'Failed to send test email';
                toast.error(errorMessage);
            }
        }
    };

    const handleSendEmail = async (reminder) => {
        setSelectedReminder(reminder);
        setShowSendEmailModal(true);
    };

    const handleSendEmailSubmit = async () => {
        if (!selectedReminder) return;

        try {
            const userToken = localStorage.getItem('userToken');

            if (!userToken) {
                toast.error('Authentication required. Please log in again.');
                setShowSendEmailModal(false);
                dispatch(logout());
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            };
            await axios.post(
                `${API_URL}/api/reminders/${selectedReminder._id}/send-email`,
                {},
                config
            );
            toast.success('Reminder email sent successfully!');
            setShowSendEmailModal(false);
        } catch (error) {
            console.error('Error sending reminder email:', error);
            setShowSendEmailModal(false);

            // Use centralized auth error handling
            if (!handleAuthError(error, dispatch, navigate)) {
                // Only handle other errors if it's not an auth error
                const errorMessage = error && error.response && error.response.data ?
                    error.response.data.message : 'Failed to send email';
                toast.error(errorMessage);
            }
        }
    };

    // Function to get reminder dates for calendar highlighting
    const getTileClassName = ({ date }) => {
        // Use pre-computed set of dates for faster lookup
        if (!reminders.length) return '';

        const dateString = date.toDateString();
        return reminderDates.has(dateString) ? 'bg-blue-100 rounded-full' : '';
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Gift Reminders</h2>
                {userInfo && userInfo.role === 'Admin' && (
                    <button
                        onClick={handleTestEmail}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        <FaBell className="h-4 w-4" />
                        Test Notification
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileClassName={getTileClassName}
                        className="w-full"
                    />
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Notify Days Before
                                </label>
                                <select
                                    value={formData.notifyBefore}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notifyBefore: parseInt(e.target.value),
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value={1}>1 day</option>
                                    <option value={3}>3 days</option>
                                    <option value={7}>1 week</option>
                                    <option value={14}>2 weeks</option>
                                    <option value={30}>1 month</option>
                                </select>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="submit"
                                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                                </button>
                                {editingReminder && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editingReminder._id)}
                                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Upcoming Reminders</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reminders
                            .filter((reminder) => new Date(reminder.date) >= new Date())
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((reminder) => (
                                <div
                                    key={reminder._id}
                                    className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{reminder.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(reminder.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {reminder.description}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            {userInfo && userInfo.role === 'Admin' && (
                                                <button
                                                    onClick={() => handleSendEmail(reminder)}
                                                    className="text-blue-500 hover:text-blue-600"
                                                    title="Send reminder email"
                                                >
                                                    <FaEnvelope />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditingReminder(reminder);
                                                    setSelectedDate(new Date(reminder.date));
                                                    setFormData({
                                                        title: reminder.title,
                                                        description: reminder.description,
                                                        date: new Date(reminder.date),
                                                        notifyBefore: reminder.notifyBefore,
                                                    });
                                                    setShowForm(true);
                                                }}
                                                className="text-yellow-500 hover:text-yellow-600"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reminder._id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Email Confirmation Modal */}
            {showSendEmailModal && selectedReminder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Send Reminder Email</h3>
                        <p className="mb-4">
                            Are you sure you want to send a reminder email for "{selectedReminder.title}"?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowSendEmailModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmailSubmit}
                                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftReminder; 