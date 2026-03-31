import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import styled from 'styled-components';

const CLIENT_ID = 'd3e28a9899bc464fa351e6fac251cb80';
const CLIENT_SECRET = 'f5a3b9ead7044ef983ab254901c56f6d';

const RaqqaMobileKitchen = () => {
  const [foods, setFoods] = useState([]);
  const [status, setStatus] = useState('جاهز للعمل...');

  const startApp = async () => {
    try {
      setStatus('جاري الحصول على التوكن (Mobile Native)...');

      // 1. طلب التوكن باستخدام CapacitorHttp
      const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
      
      const tokenOptions = {
        url: 'https://oauth.fatsecret.com/connect/token',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          grant_type: 'client_credentials',
          scope: 'basic'
        }
      };

      const tokenResponse = await CapacitorHttp.post(tokenOptions);
      const token = tokenResponse.data.access_token;

      setStatus('تم الاتصال! جاري جلب البيانات...');

      // 2. جلب الأكلات
      const foodOptions = {
        url: 'https://platform.fatsecret.com/rest/server.api',
        params: {
          method: 'foods.search',
          search_expression: 'healthy',
          format: 'json'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const foodResponse = await CapacitorHttp.get(foodOptions);
      
      // معالجة البيانات
      if (foodResponse.data.foods && foodResponse.data.foods.food) {
        const results = Array.isArray(foodResponse.data.foods.food) 
          ? foodResponse.data.foods.food 
          : [foodResponse.data.foods.food];
        setFoods(results);
        setStatus('تم التحميل بنجاح ✅');
      }

    } catch (err) {
      console.error("Native Error:", err);
      setStatus('خطأ في الاتصال الخارجي: ' + err.message);
    }
  };

  useEffect(() => {
    startApp();
  }, []);

  return (
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'Cairo' }}>
      <h2 style={{color: '#4a403a'}}>مطبخ رقة (Native Http) 📱</h2>
      <p style={{fontSize: '0.8rem', color: '#ff7675'}}>{status}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        {foods.map((f, i) => (
          <div key={i} style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <strong>{f.food_name}</strong>
            <p style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>{f.food_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaqqaMobileKitchen;
