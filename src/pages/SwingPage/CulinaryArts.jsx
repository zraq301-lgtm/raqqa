import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Search, Zap, Flame, ChevronRight, RefreshCw } from 'lucide-react';

// --- إعدادات المفاتيح التي قدمتها ---
const CLIENT_ID = 'd3e28a9899bc464fa351e6fac251cb80';
const CLIENT_SECRET = 'f5a3b9ead7044ef983ab254901c56f6d';

// --- الأنيميشن ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- التنسيق البصري (Glassmorphism) ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
  padding: 30px 5%;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
`;

const SearchBar = styled.div`
  max-width: 600px;
  margin: 0 auto 40px;
  display: flex;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 8px 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.5);
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px;
  font-family: 'Cairo';
  outline: none;
  font-size: 1rem;
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FoodCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease both;
  animation-delay: ${props => props.delay}s;

  &:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  }
`;

const CalorieBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff0f0;
  color: #ff4757;
  padding: 5px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const FoodTitle = styled.h3`
  color: #4a403a;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
`;

const Description = styled.p`
  color: #8c7e74;
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 20px;
`;

// --- المكون الرئيسي ---
const RaqqaSmartKitchen = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('healthy breakfast');

  // دالة جلب الـ Token (تلقائياً)
  const getAccessToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'basic');

    const authHeader = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    
    const response = await axios.post('https://oauth.fatsecret.com/connect/token', params, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  };

  const searchFood = useCallback(async (searchQuery) => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
        params: {
          method: 'foods.search',
          search_expression: searchQuery,
          format: 'json',
          max_results: 12
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.foods && response.data.foods.food) {
        // الـ API قد يعيد كائن واحد لو النتيجة واحدة، أو مصفوفة لو نتائج متعددة
        const results = Array.isArray(response.data.foods.food) 
          ? response.data.foods.food 
          : [response.data.foods.food];
        setFoods(results);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    searchFood(query);
  }, []);

  return (
    <PageContainer>
      <header style={{textAlign: 'center', marginBottom: '40px'}}>
        <h1 style={{color: '#4a403a', fontWeight: '900', fontSize: '2.5rem'}}>مطبخ رقة الذكي</h1>
        <p style={{color: '#8c7e74'}}>بيانات غذائية دقيقة بلمسة عصرية</p>
      </header>

      <SearchBar>
        <Search color="#8c7e74" size={20} />
        <Input 
          placeholder="ابحثي عن أكلة (مثلاً: سلطة، شوفان...)" 
          onKeyDown={(e) => e.key === 'Enter' && searchFood(e.target.value)}
        />
        <RefreshCw 
          size={20} 
          style={{cursor: 'pointer', color: '#8c7e74', animation: loading ? 'spin 1s linear infinite' : 'none'}}
          onClick={() => searchFood(query)} 
        />
      </SearchBar>

      <RecipeGrid>
        {foods.map((food, index) => (
          <FoodCard key={food.food_id} delay={index * 0.1}>
            <CalorieBadge>
              <Flame size={14} />
              بيانات موثوقة
            </CalorieBadge>
            <FoodTitle>{food.food_name}</FoodTitle>
            <Description>{food.food_description}</Description>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <span style={{fontSize: '0.75rem', color: '#b2bec3'}}>المصدر: FatSecret</span>
               <ChevronRight size={18} color="#4a403a" />
            </div>
          </FoodCard>
        ))}
      </RecipeGrid>

      {foods.length === 0 && !loading && (
        <p style={{textAlign: 'center', color: '#8c7e74'}}>لم نجد نتائج، جربي البحث بكلمات أخرى بالإنجليزية حالياً.</p>
      )}
    </PageContainer>
  );
};

export default RaqqaSmartKitchen;
