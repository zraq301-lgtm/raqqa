import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Search, Shuffle, Grid, Globe, Fish, Loader2 } from 'lucide-react';

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

const RaqqaUltimateKitchen = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('random');

  // دالة مركزية للتحكم في كل الروابط التي أرسلتها
  const fetchData = async (type, value = '') => {
    setLoading(true);
    let url = "";

    switch (type) {
      case 'search': // الرابط الثاني (البحث بالاسم أو الحرف)
        url = `${API_BASE}/search.php?s=${value}`;
        break;
      case 'letter': // الرابط الثاني (البحث بأول حرف)
        url = `${API_BASE}/search.php?f=${value || 'a'}`;
        break;
      case 'lookup': // الرابط الثالث (البحث برقم التعريف)
        url = `${API_BASE}/lookup.php?i=${value || '52772'}`;
        break;
      case 'random': // الرابط الرابع والخامس (عشوائي)
        url = `${API_BASE}/random.php`;
        break;
      case 'categories': // الرابط السادس (التصنيفات)
        url = `${API_BASE}/categories.php`;
        break;
      case 'area': // الرابط السابع (حسب البلد - كندي مثلاً)
        url = `${API_BASE}/filter.php?a=${value || 'Canadian'}`;
        break;
      case 'filter': // الرابط الثامن (حسب النوع - مأكولات بحرية)
        url = `${API_BASE}/filter.php?c=${value || 'Seafood'}`;
        break;
      default:
        url = `${API_BASE}/random.php`;
    }

    try {
      const res = await axios.get(url);
      // التعامل مع اختلاف شكل البيانات المرجعة من الروابط المختلفة
      if (type === 'categories') {
        setMeals(res.data.categories.map(cat => ({ 
          strMeal: cat.strCategory, 
          strMealThumb: cat.strCategoryThumb, 
          idMeal: cat.idCategory,
          isCategory: true 
        })));
      } else {
        setMeals(res.data.meals || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData('random'); }, []);

  return (
    <Container>
      <Header>
        <h1>محرّك أطباق رقة</h1>
        <p>كل روابط الـ API في مكان واحد</p>
      </Header>

      <SearchSection>
        <div className="search-bar">
          <Search size={20} />
          <input 
            placeholder="ابحث بالاسم (الرابط 2)..." 
            onKeyDown={(e) => e.key === 'Enter' && fetchData('search', e.target.value)}
          />
        </div>

        <FilterButtons>
          <button onClick={() => {fetchData('random'); setActiveTab('random')}} className={activeTab === 'random' ? 'active' : ''}>
            <Shuffle size={16} /> عشوائي (رابط 4)
          </button>
          <button onClick={() => {fetchData('filter', 'Seafood'); setActiveTab('seafood')}} className={activeTab === 'seafood' ? 'active' : ''}>
            <Fish size={16} /> بحريات (رابط 8)
          </button>
          <button onClick={() => {fetchData('area', 'Canadian'); setActiveTab('area')}} className={activeTab === 'area' ? 'active' : ''}>
            <Globe size={16} /> كندي (رابط 7)
          </button>
          <button onClick={() => {fetchData('categories'); setActiveTab('cat')}} className={activeTab === 'cat' ? 'active' : ''}>
            <Grid size={16} /> أقسام (رابط 6)
          </button>
        </FilterButtons>
      </SearchSection>

      {loading ? (
        <LoadingBox><Loader2 className="spin" /> جاري جلب البيانات من الروابط...</LoadingBox>
      ) : (
        <ResultsGrid>
          {meals.map((meal) => (
            <Card key={meal.idMeal}>
              <img src={meal.strMealThumb} alt={meal.strMeal} />
              <div className="info">
                <h3>{meal.strMeal}</h3>
                {!meal.isCategory && (
                  <button onClick={() => window.open(meal.strYoutube || `https://www.google.com/search?q=${meal.strMeal}+recipe`)}>
                    عرض التفاصيل
                  </button>
                )}
              </div>
            </Card>
          ))}
        </ResultsGrid>
      )}
    </Container>
  );
};

// --- التنسيقات (Styled Components) ---
const Container = styled.div`
  direction: rtl; font-family: 'Cairo', sans-serif; padding: 40px 5%; background: #fdfbfb; min-height: 100vh;
`;

const Header = styled.div`
  text-align: center; margin-bottom: 40px;
  h1 { color: #2d3436; font-weight: 900; }
  p { color: #636e72; }
`;

const SearchSection = styled.div`
  max-width: 800px; margin: 0 auto 50px;
  .search-bar {
    display: flex; align-items: center; background: white; padding: 12px 20px; border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 20px;
    input { flex: 1; border: none; outline: none; padding: 0 15px; font-family: 'Cairo'; }
  }
`;

const FilterButtons = styled.div`
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  button {
    display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 50px;
    border: 1px solid #eee; background: white; cursor: pointer; transition: 0.3s; font-family: 'Cairo';
    &.active { background: #ff7675; color: white; border-color: #ff7675; }
    &:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
  }
`;

const ResultsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px;
`;

const Card = styled.div`
  background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.03);
  transition: 0.3s;
  &:hover { transform: scale(1.03); }
  img { width: 100%; height: 180px; object-fit: cover; }
  .info { padding: 15px; text-align: center;
    h3 { font-size: 1rem; margin-bottom: 12px; height: 40px; overflow: hidden; }
    button { width: 100%; padding: 8px; border: none; border-radius: 10px; background: #f1f2f6; cursor: pointer; }
  }
`;

const LoadingBox = styled.div`
  text-align: center; padding: 50px; color: #636e72;
  .spin { animation: rotate 2s linear infinite; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default RaqqaUltimateKitchen;
