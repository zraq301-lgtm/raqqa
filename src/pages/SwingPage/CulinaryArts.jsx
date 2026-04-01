import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Search, Play, Star, Coffee, Fish, Beef, Pizza, IceCream, Utensils, Loader2 } from 'lucide-react';

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

// قاموس ترجمة للأقسام لضمان ظهورها بالعربي
const translateTag = (tag) => {
  const translations = {
    'Seafood': 'مأكولات بحرية',
    'Dessert': 'حلويات',
    'Beef': 'لحوم حمراء',
    'Chicken': 'دواجن',
    'Breakfast': 'فطور',
    'Vegetarian': 'نباتي',
    'Italian': 'إيطالي',
    'Canadian': 'كندي',
    'Miscellaneous': 'منوعات'
  };
  return translations[tag] || tag;
};

const RaqqaArabicKitchen = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Random');

  const fetchData = async (type, value = '') => {
    setLoading(true);
    let url = "";
    switch (type) {
      case 'search': url = `${API_BASE}/search.php?s=${value}`; break;
      case 'cat': url = `${API_BASE}/filter.php?c=${value}`; break;
      case 'area': url = `${API_BASE}/filter.php?a=${value}`; break;
      // تم تصحيح الرابط هنا من randomselection إلى random
      default: url = `${API_BASE}/random.php`; 
    }

    try {
      const res = await axios.get(url);
      // التأكد من أن البيانات مصفوفة حتى لو كانت وجبة واحدة (Random)
      const mealData = res.data.meals;
      setMeals(Array.isArray(mealData) ? mealData : []);
    } catch (err) { 
      console.error(err); 
      setMeals([]); // إفراغ النتائج في حال حدوث خطأ لمنع الشاشة البيضاء
    }
    setLoading(false);
  };

  useEffect(() => { fetchData('random'); }, []);

  return (
    <PageContainer>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title>مطبخ رقة</Title>
        <Subtitle>أشهى الوصفات العالمية بلمسة عربية</Subtitle>
      </header>

      {/* محرك البحث */}
      <SearchWrapper>
        <Search size={22} color="#b2bec3" />
        <StyledInput 
          placeholder="ابحثي عن وجبة بالإنجليزية (مثل: Pizza)..." 
          onKeyDown={(e) => e.key === 'Enter' && fetchData('search', e.target.value)}
        />
      </SearchWrapper>

      {/* الأزرار الأنيقة باللغة العربية */}
      <FilterBar>
        <NavButton active={activeTab === 'Random'} onClick={() => {fetchData('random'); setActiveTab('Random')}}>
          <Star size={18} /> عشوائي
        </NavButton>
        <NavButton active={activeTab === 'Dessert'} onClick={() => {fetchData('cat', 'Dessert'); setActiveTab('Dessert')}}>
          <IceCream size={18} /> حلويات
        </NavButton>
        <NavButton active={activeTab === 'Seafood'} onClick={() => {fetchData('cat', 'Seafood'); setActiveTab('Seafood')}}>
          <Fish size={18} /> بحريات
        </NavButton>
        <NavButton active={activeTab === 'Meat'} onClick={() => {fetchData('cat', 'Beef'); setActiveTab('Meat')}}>
          <Beef size={18} /> لحوم
        </NavButton>
        <NavButton active={activeTab === 'Italian'} onClick={() => {fetchData('area', 'Italian'); setActiveTab('Italian')}}>
          <Pizza size={18} /> إيطالي
        </NavButton>
        <NavButton active={activeTab === 'Breakfast'} onClick={() => {fetchData('cat', 'Breakfast'); setActiveTab('Breakfast')}}>
          <Coffee size={18} /> فطور
        </NavButton>
      </FilterBar>

      {loading ? (
        <LoadingBox><Loader2 className="spin" size={40} /> جاري جلب الوصفات...</LoadingBox>
      ) : (
        <RecipesGrid>
          {meals && meals.map((meal, index) => (
            <RecipeCard key={meal.idMeal} delay={index * 0.1}>
              <ImageWrapper>
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <Badge>{translateTag(meal.strCategory) || 'وصفة مختارة'}</Badge>
              </ImageWrapper>
              <CardContent>
                <h3>{meal.strMeal}</h3>
                <p>المنشأ: {translateTag(meal.strArea)}</p>
                <ChefButton onClick={() => window.open(meal.strYoutube, '_blank')}>
                  <Play size={18} fill="white" />
                  شاهد الشيف
                </ChefButton>
              </CardContent>
            </RecipeCard>
          ))}
        </RecipesGrid>
      )}
    </PageContainer>
  );
};

// --- التنسيقات الفاخرة ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh; background: #fffafb; padding: 60px 8%; direction: rtl; font-family: 'Cairo', sans-serif;
`;

const Title = styled.h1`
  font-size: 3.2rem; color: #1e272e; font-weight: 900; margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #ef5777; font-size: 1.2rem; margin-bottom: 40px; font-weight: 600;
`;

const SearchWrapper = styled.div`
  max-width: 700px; margin: 0 auto 35px; background: #fff; border-radius: 20px;
  padding: 15px 25px; display: flex; align-items: center; box-shadow: 0 20px 40px rgba(0,0,0,0.03);
`;

const StyledInput = styled.input`
  flex: 1; border: none; outline: none; margin-right: 15px; font-size: 1.1rem; font-family: 'Cairo';
`;

const FilterBar = styled.div`
  display: flex; justify-content: center; gap: 15px; margin-bottom: 60px; flex-wrap: wrap;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#ef5777' : '#fff'};
  color: ${props => props.active ? '#fff' : '#485460'};
  border: none; padding: 12px 28px; border-radius: 15px; display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-family: 'Cairo'; font-weight: 700; transition: 0.4s;
  box-shadow: 0 10px 20px rgba(0,0,0,0.02);
  &:hover { transform: translateY(-5px); box-shadow: 0 15px 25px rgba(239, 87, 119, 0.2); }
`;

const RecipesGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 40px;
`;

const RecipeCard = styled.div`
  background: #fff; border-radius: 35px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.04);
  animation: ${fadeInUp} 0.7s ease forwards; animation-delay: ${props => props.delay}s;
  opacity: 0; transition: 0.4s ease;
  &:hover { transform: scale(1.02); }
`;

const ImageWrapper = styled.div`
  position: relative; height: 260px;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Badge = styled.span`
  position: absolute; top: 25px; right: 25px; background: #ffffffcc; backdrop-filter: blur(8px);
  padding: 6px 18px; border-radius: 50px; font-size: 0.85rem; font-weight: 800; color: #ef5777;
`;

const CardContent = styled.div`
  padding: 30px;
  h3 { color: #1e272e; font-size: 1.4rem; margin-bottom: 10px; }
  p { color: #808e9b; font-size: 1rem; margin-bottom: 25px; }
`;

const ChefButton = styled.button`
  width: 100%; background: #1e272e; color: #fff; border: none; padding: 15px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; gap: 12px; font-family: 'Cairo';
  font-weight: 800; cursor: pointer; transition: 0.3s;
  &:hover { background: #ef5777; }
`;

const LoadingBox = styled.div`
  text-align: center; padding: 100px;
  .spin { animation: spin 1s linear infinite; margin-bottom: 20px; color: #ef5777; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default RaqqaArabicKitchen;
