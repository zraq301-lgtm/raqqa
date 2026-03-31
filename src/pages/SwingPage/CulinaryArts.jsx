import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// المفاتيح التي قدمتها
const CLIENT_ID = 'd3e28a9899bc464fa351e6fac251cb80';
const CLIENT_SECRET = 'f5a3b9ead7044ef983ab254901c56f6d';

// بروكسي مجاني لتخطي مشكلة الـ CORS أثناء التطوير
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

const RaqqaSmartKitchen = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAccessToken = async () => {
    // نستخدم URLSearchParams كما تطلب المنصة بالضبط
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'basic');

    const authHeader = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    
    // الطلب عبر البروكسي
    const response = await axios.post(`${PROXY_URL}https://oauth.fatsecret.com/connect/token`, params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.data.access_token;
  };

  const searchFood = useCallback(async (searchQuery = 'apple') => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const response = await axios.get(`${PROXY_URL}https://platform.fatsecret.com/rest/server.api`, {
        params: {
          method: 'foods.search',
          search_expression: searchQuery,
          format: 'json',
          max_results: 10
        },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.data.foods && response.data.foods.food) {
        const results = Array.isArray(response.data.foods.food) 
          ? response.data.foods.food 
          : [response.data.foods.food];
        setFoods(results);
      } else {
        setError("لم يتم العثور على نتائج. جرب البحث بالإنجليزية مثل 'Chicken'.");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال. تأكد من تفعيل بروكسي CORS أو جرب لاحقاً.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    searchFood();
  }, [searchFood]);

  return (
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'Cairo', textAlign: 'center' }}>
      <h1 style={{color: '#4a403a'}}>مطبخ رقة الذكي</h1>
      
      {loading && <p>جاري تحميل البيانات من FatSecret...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {foods.map((food) => (
          <div key={food.food_id} style={{ background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{fontSize: '1.1rem'}}>{food.food_name}</h3>
            <p style={{fontSize: '0.85rem', color: '#666'}}>{food.food_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaqqaSmartKitchen;
