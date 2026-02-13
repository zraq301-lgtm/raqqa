import React from 'react';
// التصحيح: المسار الصحيح للوصول لملف الأيقونات من مجلد HealthPages
import { iconMap } from '../../constants/iconMap'; 

const MedicalArticle = () => {
  // استخدام أيقونة الدردشة/النصيحة (chat)
  const Icon = iconMap.chat; 

  return (
    <div style={styles.pageBackground}>
      <article style={styles.container}>
        {/* Header Section */}
        <header style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
             {Icon && <Icon size={40} color="#d63384" />}
          </div>
          <div style={styles.badge}>مقالات طبية متخصصة</div>
          <h1 style={styles.mainTitle}>المرأة: قلب المجتمع النابض وصحّتها هي "الاستثمار الرابح"</h1>
          <p style={styles.author}>بقلم: د. أحمد المعتز (طبيب استشاري)</p>
        </header>

        {/* Featured Image */}
        <div style={styles.imageContainer}>
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" 
            alt="صحة المرأة واليوغا" 
            style={styles.image}
          />
        </div>

        {/* Introduction */}
        <section style={styles.introSection}>
          <p style={styles.paragraph}>
            دائمًا ما أقول لمرضايا في العيادة: <span style={styles.highlight}>"إن صحة المرأة ليست مجرد غياب للمرض، بل هي حالة من الحيوية التي تمنح الحياة لمن حولها."</span> عندما تهتم المرأة بنفسها، هي لا تفعل ذلك من أجل "الأنانية"، بل هي تبني الأساس الذي يقوم عليه استقرار الأسرة وتوازن المجتمع.
          </p>
        </section>

        {/* Tips Section */}
        <section style={styles.content}>
          <h2 style={styles.subTitle}>خلاصات طبية لحياة متزنة</h2>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>1. قاعدة "المثلث الذهبي" للتمثيل الغذائي</h3>
            <p>السر يكمن في التوازن الهرموني، وهو ما يتطلب:</p>
            <ul>
              <li><strong>البروتين الكافي:</strong> للحفاظ على الكتلة العضلية وكثافة العظام.</li>
              <li><strong>الدهون الصحية:</strong> أوميغا 3 هو صديق الدماغ والهرمونات الأول.</li>
              <li><strong>الألياف:</strong> "المكنسة" التي تخلص الجسم من السموم.</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>2. النشاط البدني: "دواء" مجاني</h3>
            <p>الرياضة هي أقوى مضاد اكتئاب طبيعي. ممارسة المقاومة مرتين أسبوعياً تحمي من هشاشة العظام، والمشي السريع يحسن التدفق الدموي.</p>
          </div>
        </section>

        {/* Table Section */}
        <section style={styles.tableSection}>
          <h2 style={styles.subTitle}>جدول الفحوصات الدورية</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>الفحص</th>
                <th style={styles.th}>التكرار الموصى به</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>صورة الدم (CBC) وفيتامين د</td>
                <td style={styles.td}>سنوياً</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer style={styles.footerQuote}>
          <p>
            <blockquote>
              "تذكري أن الكوب الفارغ لا يمكنه سقي الآخرين. اهتمامك بصحتك ليس رفاهية، بل هو المحرك الأساسي للعطاء."
            </blockquote>
          </p>
        </footer>
      </article>
    </div>
  );
};

// CSS in JS Styles
const styles = {
  pageBackground: { backgroundColor: '#f9f5f6', padding: '40px 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl' },
  container: { maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '40px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  badge: { display: 'inline-block', padding: '5px 15px', backgroundColor: '#ffecf1', color: '#d63384', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' },
  mainTitle: { color: '#2c3e50', fontSize: '2.2rem', lineHeight: '1.4', margin: '10px 0' },
  author: { color: '#7f8c8d', fontStyle: 'italic' },
  imageContainer: { width: '100%', height: '350px', borderRadius: '15px', overflow: 'hidden', marginBottom: '30px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  introSection: { borderRight: '5px solid #d63384', paddingRight: '20px', margin: '30px 0', fontSize: '1.2rem', lineHeight: '1.8', color: '#34495e' },
  highlight: { color: '#d63384', fontWeight: 'bold' },
  subTitle: { color: '#d63384', fontSize: '1.6rem', borderBottom: '2px solid #fce4ec', paddingBottom: '10px', marginBottom: '20px' },
  card: { backgroundColor: '#fff9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffecf1' },
  cardTitle: { color: '#2c3e50', marginTop: '0' },
  tableSection: { marginTop: '40px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { backgroundColor: '#d63384', color: 'white', padding: '12px', textAlign: 'right' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  footerQuote: { marginTop: '50px', textAlign: 'center', padding: '30px', backgroundColor: '#2c3e50', color: 'white', borderRadius: '15px', fontSize: '1.3rem', lineHeight: '1.6' }
};

export default MedicalArticle;
