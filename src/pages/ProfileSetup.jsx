import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileScreen = () => {
    const [user, setUser] = useState({ name: '', bio: '', email: '' });
    const [loading, setLoading] = useState(true);

    // 1. جلب البيانات من سيرفر Vercel عند تحميل الصفحة
    useEffect(() => {
        axios.get('https://your-api-on-vercel.app/api/user/profile')
            .then(response => {
                setUser(response.data);
                setLoading(false);
            })
            .catch(error => console.error("خطأ في جلب البيانات", error));
    }, []);

    // 2. دالة حفظ التعديلات وإرسالها للسيرفر
    const handleUpdate = () => {
        axios.post('https://your-api-on-vercel.app/api/user/update', user)
            .then(() => alert("تم التحديث بنجاح!"))
            .catch(() => alert("فشل التحديث"));
    };

    if (loading) return <p>جاري التحميل...</p>;

    return (
        <div className="profile-container">
            <h1>ملفي الشخصي</h1>
            <input 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})} 
                placeholder="الاسم"
            />
            <textarea 
                value={user.bio} 
                onChange={(e) => setUser({...user, bio: e.target.value})} 
                placeholder="نبذة عنك"
            />
            <button onClick={handleUpdate}>حفظ التغييرات</button>
        </div>
    );
};

export default ProfileScreen;
