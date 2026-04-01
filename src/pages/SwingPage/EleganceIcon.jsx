import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Sparkles, Wand2, Shirt, Heart, ShoppingBag, RefreshCw } from 'lucide-react';

// تأكد أن المتغير في Vercel مكتوب بهذا الاسم بالضبط
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY || import.meta.env.REACT_APP_UNSPLASH_KEY;

const RaqqaDynamicCenter = () => {
  const [mainTab, setMainTab] = useState('beauty'); // beauty | fashion
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // دالة جلب البيانات الحية بناءً على القسم
  const fetchLiveContent = async () => {
    if (!UNSPLASH_KEY) {
      console.error("المفتاح غير موجود! تأكد من إضافته في إعدادات Vercel");
      return;
    }
    
    setLoading(true);
    // كلمات بحث ذكية لضمان صور محجبات في قسم الأزياء وصور تجميل في الجمال
    const query = mainTab === 'fashion' 
      ? "hijab modest fashion style" 
      : "skincare makeup cosmetics organic";

    try {
      const response = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
          query: query,
          per_page: 12,
          orientation: 'portrait',
          client_id: UNSPLASH_KEY
        }
      });

      // تحويل الصور إلى "بطاقات نصائح" ديناميكية
      const dynamicData = response.data.results.map((img, index) => ({
        id: img.id,
        image: img.urls.regular,
        title: mainTab === 'fashion' ? `تنسيق رقم ${index + 1}` : `سر الجمال رقم ${index + 1}`,
        description: img.alt_description || (mainTab === 'fashion' ? "إطلالة محتشمة وعصرية تناسبك" : "وصفة طبيعية لنضارة بشرتك"),
        likes: img.likes,
        user: img.user.name
      }));

      setItems(dynamicData);
    } catch (err) {
      console.error("خطأ في الاتصال بـ Unsplash:", err);
    }
    setLoading(false);
  };

  // جلب البيانات عند تغيير القسم أو فتح الصفحة
  useEffect(() => {
    fetchLiveContent();
  }, [mainTab]);

  return (
    <Container>
      <Header>
        <MainTitle>رقة: الإلهام الحي</MainTitle>
        <p>محتوى متجدد لحظياً من أكبر منصات الصور العالمية</p>
        
        <TabSwitcher>
          <SwitchBtn active={mainTab === 'beauty'} onClick={() => setMainTab('beauty')}>
            <Wand2 size={18} /> نصائح الجمال
          </SwitchBtn>
          <SwitchBtn active={mainTab === 'fashion'} onClick={() => setMainTab('fashion')}>
            <Shirt size={18} /> أزياء محجبات
          </SwitchBtn>
        </TabSwitcher>
      </Header>

      {loading ? (
        <LoadingArea>
          <RefreshCw className="spin" size={40} />
          <p>جاري جلب أحدث الصور والتوجهات...</p>
        </LoadingArea>
      ) : (
        <MasonryGrid>
          {items.map((item) => (
            <BeautyCard key={item.id}>
              <div className="img-container">
                <img src={item.image} alt={item.title} />
                <div className="overlay-badge">
                   <Heart size={12} fill="white" /> {item.likes}
                </div>
              </div>
              <CardInfo>
                <Badge>{mainTab === 'fashion' ? 'أزياء' : 'جمال'}</Badge>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="footer">
                  <span>بواسطة: {item.user}</span>
                  <button><ShoppingBag size={16} /> استعراض</button>
                </div>
              </CardInfo>
            </BeautyCard>
          ))}
        </MasonryGrid>
      )}

      <RefreshButton onClick={fetchLiveContent}>
        <RefreshCw size={20} /> تحديث المحتوى
      </RefreshButton>
    </Container>
  );
};

// --- التنسيقات (Styled Components) ---

const Container = styled.div`
  min-height: 100vh; background: #fffafb; padding: 50px 5%; direction: rtl; font-family: 'Cairo', sans-serif;
`;

const Header = styled.div`
  text-align: center; margin-bottom: 50px;
  p { color: #888; margin-top: 10px; }
`;

const MainTitle = styled.h1`
  font-size: 3rem; color: #1e272e; font-weight: 900;
`;

const TabSwitcher = styled.div`
  margin-top: 30px; display: inline-flex; background: #eee; padding: 6px; border-radius: 50px;
`;

const SwitchBtn = styled.button`
  padding: 12px 25px; border: none; border-radius: 50px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-family: 'Cairo'; font-weight: 800;
  background: ${props => props.active ? '#ff7675' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};
  transition: 0.3s;
`;

const MasonryGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;
`;

const BeautyCard = styled.div`
  background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: 0.3s;
  &:hover { transform: translateY(-10px); }
  .img-container {
    position: relative; height: 350px;
    img { width: 100%; height: 100%; object-fit: cover; }
    .overlay-badge {
      position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.5);
      color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;
    }
  }
`;

const CardInfo = styled.div`
  padding: 20px;
  h3 { font-size: 1.2rem; margin: 10px 0; color: #2d3436; }
  p { font-size: 0.9rem; color: #636e72; line-height: 1.6; height: 50px; overflow: hidden; }
  .footer {
    margin-top: 15px; display: flex; justify-content: space-between; align-items: center;
    span { font-size: 0.75rem; color: #b2bec3; }
    button { border: none; background: #f1f2f6; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-family: 'Cairo'; }
  }
`;

const Badge = styled.span`
  background: #fff0f0; color: #ff7675; padding: 3px 10px; border-radius: 5px; font-size: 0.7rem; font-weight: 800;
`;

const LoadingArea = styled.div`
  text-align: center; padding: 100px; color: #ff7675;
  .spin { animation: rotate 2s linear infinite; margin-bottom: 20px; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const RefreshButton = styled.button`
  position: fixed; bottom: 30px; left: 30px; background: #1e272e; color: white;
  border: none; padding: 15px 25px; border-radius: 50px; display: flex; align-items: center; gap: 10px;
  font-family: 'Cairo'; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.2);
`;

export default RaqqaDynamicCenter;
