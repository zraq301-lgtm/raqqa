import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Search, Play, Star, Coffee, Fish, Beef, Pizza, IceCream, Utensils, Loader2 } from 'lucide-react';

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

const translateTag = (tag) => {
  const translations = {
    'Seafood': 'مأكولات بحرية', 'Dessert': 'حلويات', 'Beef': 'لحوم حمراء',
    'Chicken': 'دواجن', 'Breakfast': 'فطور', 'Vegetarian': 'نباتي',
    'Italian': 'إيطالي', 'Canadian': 'كندي', 'Miscellaneous': 'منوعات'
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
      default: url = `${API_BASE}/random.php`; 
    }

    try {
      const res = await axios.get(url);
      setMeals(res.data.meals || []);
    } catch (err) { 
      console.error(err); 
      setMeals([]); 
    }
    setLoading(false);
  };

  // وظيفة جلب الفيديو بدقة لكل أكلة عند الضغط
  const handleVideoOpen = async (idMeal, currentYoutube) => {
    if (currentYoutube) {
      window.open(currentYoutube, '_blank');
      return;
    }
    // جلب التفاصيل إذا كان الرابط ناقصاً
    try {
      const res = await axios.get(`${API_BASE}/lookup.php?i=${idMeal}`);
      const video = res.data.meals[0].strYoutube;
      if (video) window.open(video, '_blank');
      else alert("عذراً، الفيديو غير متوفر لهذه الوصفة");
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchData('random'); }, []);

  return (
    <PageContainer>
      <HeaderSection>
        {/* زر مطبخ رقة الكبير مع صورة الشيف المكبرة 4 مرات */}
        <BrandBadge>
          <img src="/assets/icons/chef.png" alt="Chef" onError={(e) => e.target.style.display='none'} />
          مطبخ رقة
        </BrandBadge>
        <Subtitle>أشهى الوصفات العالمية بلمسة عربية</Subtitle>
      </HeaderSection>

      <SearchWrapper>
        <Search size={22} color="#b2bec3" />
        <StyledInput 
          placeholder="ابحثي عن وجبة (مثل: Pizza)..." 
          onKeyDown={(e) => e.key === 'Enter' && fetchData('search', e.target.value)}
        />
      </SearchWrapper>

      <FilterBar>
        {['Random', 'Dessert', 'Seafood', 'Beef', 'Italian', 'Breakfast'].map((tab) => (
          <NavButton 
            key={tab}
            active={activeTab === tab} 
            onClick={() => {
              const type = tab === 'Random' ? 'random' : (tab === 'Italian' ? 'area' : 'cat');
              fetchData(type, tab === 'Beef' ? 'Beef' : tab); 
              setActiveTab(tab);
            }}
          >
             {tab === 'Random' && <Star size={18} />}
             {tab === 'Dessert' && <IceCream size={18} />}
             {tab === 'Seafood' && <Fish size={18} />}
             {tab === 'Beef' && <Beef size={18} />}
             {tab === 'Italian' && <Pizza size={18} />}
             {tab === 'Breakfast' && <Coffee size={18} />}
             {translateTag(tab)}
          </NavButton>
        ))}
      </FilterBar>

      {loading ? (
        <LoadingBox><Loader2 className="spin" size={40} /> جاري جلب الوصفات...</LoadingBox>
      ) : (
        <RecipesGrid>
          {meals.map((meal, index) => (
            <RecipeCard key={meal.idMeal} delay={index * 0.1}>
              <ImageWrapper>
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <Badge>{translateTag(meal.strCategory) || 'وصفة مختارة'}</Badge>
              </ImageWrapper>
              <CardContent>
                <h3>{meal.strMeal}</h3>
                <p>المنشأ: {translateTag(meal.strArea) || 'عالمي'}</p>
                <ChefButton onClick={() => handleVideoOpen(meal.idMeal, meal.strYoutube)}>
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

// --- التنسيقات المعدلة ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh; background: #fffafb; padding: 40px 8%; direction: rtl; font-family: 'Cairo', sans-serif;
`;

const HeaderSection = styled.header`
  text-align: center; margin-bottom: 50px; display: flex; flex-direction: column; align-items: center; gap: 5px;
`;

const BrandBadge = styled.div`
  background: white; padding: 20px 40px; border-radius: 60px;
  display: flex; align-items: center; gap: 20px; font-size: 2.2rem; font-weight: 900;
  color: #ef5777; box-shadow: 0 15px 35px rgba(239, 87, 119, 0.15);
  margin-bottom: 10px; cursor: default; /* منع شكل اليد عند التأشير لأنه ليس رابطاً */
  
  img { 
    width: 120px; /* تم تكبير الصورة 4 مرات (من 30px إلى 120px) */
    height: 120px; 
    object-fit: contain; 
  }
`;

const Subtitle = styled.p`
  color: #808e9b; font-size: 1.2rem; margin: 0; font-weight: 600;
`;

const SearchWrapper = styled.div`
  max-width: 700px; margin: 0 auto 35px; background: #fff; border-radius: 20px;
  padding: 15px 25px; display: flex; align-items: center; box-shadow: 0 20px 40px rgba(0,0,0,0.03);
`;

const StyledInput = styled.input`
  flex: 1; border: none; outline: none; margin-right: 15px; font-size: 1.1rem; font-family: 'Cairo';
`;

const FilterBar = styled.div`
  display: flex; justify-content: center; gap: 12px; margin-bottom: 60px; flex-wrap: wrap;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#ef5777' : '#fff'};
  color: ${props => props.active ? '#fff' : '#485460'};
  border: none; padding: 10px 22px; border-radius: 15px; display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-family: 'Cairo'; font-weight: 700; transition: 0.3s;
  box-shadow: 0 10px 20px rgba(0,0,0,0.02);
  &:hover { transform: translateY(-3px); }
`;

const RecipesGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;
`;

const RecipeCard = styled.div`
  background: #fff; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  animation: ${fadeInUp} 0.6s ease forwards; animation-delay: ${props => props.delay}s;
  opacity: 0;
`;

const ImageWrapper = styled.div`
  position: relative; height: 240px;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Badge = styled.span`
  position: absolute; top: 20px; right: 20px; background: #ffffffdd; backdrop-filter: blur(5px);
  padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; font-weight: 800; color: #ef5777;
`;

const CardContent = styled.div`
  padding: 25px;
  h3 { color: #1e272e; font-size: 1.3rem; margin-bottom: 8px; }
  p { color: #808e9b; font-size: 0.95rem; margin-bottom: 20px; }
`;

const ChefButton = styled.button`
  width: 100%; background: #1e272e; color: #fff; border: none; padding: 14px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center; gap: 10px; font-family: 'Cairo';
  font-weight: 800; cursor: pointer; transition: 0.3s;
  &:hover { background: #ef5777; }
`;

const LoadingBox = styled.div`
  text-align: center; padding: 80px; font-family: 'Cairo';
  .spin { animation: spin 1s linear infinite; margin-bottom: 15px; color: #ef5777; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default RaqqaArabicKitchen;
