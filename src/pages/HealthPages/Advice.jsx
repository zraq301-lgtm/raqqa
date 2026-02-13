import React from 'react';
// التصحيح: الخروج مستويين للوصول إلى src/constants/iconMap.js
import { iconMap } from '../../constants/iconMap'; 

const MedicalArticle = () => {
  // استخدام أيقونة الدردشة/النصيحة (chat) من الخريطة
  const Icon = iconMap.chat; 

  return (
    <div style={styles.pageBackground}>
      <article style={styles.container}>
        {/* Header Section */}
        <header style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
             <Icon size={40} color="#d63384" />
          </div>
          [cite_start]<div style={styles.badge}>مقالات طبية متخصصة [cite: 13]</div>
          [cite_start]<h1 style={styles.mainTitle}>المرأة: قلب المجتمع النابض وصحّتها هي "الاستثمار الرابح" [cite: 13]</h1>
          <p style={styles.author}>بقلم: د. [cite_start]أحمد المعتز (طبيب استشاري) [cite: 13]</p>
        </header>

        {/* Featured Image */}
        <div style={styles.imageContainer}>
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" 
            alt="صحة المرأة واليوغا" 
            [cite_start]style={styles.image} [cite: 14]
          />
        </div>

        {/* Introduction */}
        <section style={styles.introSection}>
          <p style={styles.paragraph}>
            [cite_start]دائمًا ما أقول لمرضايا في العيادة: <span style={styles.highlight}>"إن صحة المرأة ليست مجرد غياب للمرض، بل هي حالة من الحيوية التي تمنح الحياة لمن حولها." [cite: 15][cite_start]</span> عندما تهتم المرأة بنفسها، هي لا تفعل ذلك من أجل "الأنانية"، بل هي تبني الأساس الذي يقوم عليه استقرار الأسرة وتوازن المجتمع. [cite: 15]
          </p>
        </section>

        {/* Tips Section */}
        <section style={styles.content}>
          [cite_start]<h2 style={styles.subTitle}>خلاصات طبية لحياة متزنة [cite: 16]</h2>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>1. [cite_start]قاعدة "المثلث الذهبي" للتمثيل الغذائي [cite: 17]</h3>
            [cite_start]<p>السر يكمن في التوازن الهرموني، وهو ما يتطلب: [cite: 17]</p>
            <ul>
              [cite_start]<li><strong>البروتين الكافي:</strong> للحفاظ على الكتلة العضلية وكثافة العظام. [cite: 17]</li>
              [cite_start]<li><strong>الدهون الصحية:</strong> أوميغا 3 هو صديق الدماغ والهرمونات الأول. [cite: 17]</li>
              [cite_start]<li><strong>الألياف:</strong> "المكنسة" التي تخلص الجسم من السموم. [cite: 17]</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>2. [cite_start]النشاط البدني: "دواء" مجاني [cite: 19]</h3>
            [cite_start]<p>الرياضة هي أقوى مضاد اكتئاب طبيعي. [cite: 19] [cite_start]ممارسة المقاومة مرتين أسبوعياً تحمي من هشاشة العظام، والمشي السريع يحسن التدفق الدموي. [cite: 20]</p>
          </div>
        </section>

        {/* Table Section */}
        <section style={styles.tableSection}>
          [cite_start]<h2 style={styles.subTitle}>جدول الفحوصات الدورية [cite: 22]</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                [cite_start]<th style={styles.th}>الفحص [cite: 23]</th>
                [cite_start]<th style={styles.th}>التكرار الموصى به [cite: 23]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                [cite_start]<td style={styles.td}>صورة الدم (CBC) وفيتامين د [cite: 24]</td>
                [cite_start]<td style={styles.td}>سنوياً [cite: 24]</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer style={styles.footerQuote}>
          [cite_start]<p><blockquote>"تذكري أن الكوب الفارغ لا يمكنه سقي الآخرين. [cite: 26] [cite_start]اهتمامك بصحتك ليس رفاهية، بل هو المحرك الأساسي للعطاء." [cite: 27]</blockquote></p>
        </footer>
      </article>
    </div>
  );
};

// CSS in JS Styles
const styles = {
  [cite_start]pageBackground: { backgroundColor: '#f9f5f6', padding: '40px 20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl' }, [cite: 27]
  [cite_start]container: { maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '40px' }, [cite: 28]
  [cite_start]header: { textAlign: 'center', marginBottom: '30px' }, [cite: 28]
  [cite_start]badge: { display: 'inline-block', padding: '5px 15px', backgroundColor: '#ffecf1', color: '#d63384', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }, [cite: 28]
  [cite_start]mainTitle: { color: '#2c3e50', fontSize: '2.2rem', lineHeight: '1.4', margin: '10px 0' }, [cite: 28]
  [cite_start]author: { color: '#7f8c8d', fontStyle: 'italic' }, [cite: 29]
  [cite_start]imageContainer: { width: '100%', height: '350px', borderRadius: '15px', overflow: 'hidden', marginBottom: '30px' }, [cite: 29]
  [cite_start]image: { width: '100%', height: '100%', objectFit: 'cover' }, [cite: 29]
  [cite_start]introSection: { borderRight: '5px solid #d63384', paddingRight: '20px', margin: '30px 0', fontSize: '1.2rem', lineHeight: '1.8', color: '#34495e' }, [cite: 29]
  [cite_start]highlight: { color: '#d63384', fontWeight: 'bold' }, [cite: 30]
  [cite_start]subTitle: { color: '#d63384', fontSize: '1.6rem', borderBottom: '2px solid #fce4ec', paddingBottom: '10px', marginBottom: '20px' }, [cite: 30]
  [cite_start]card: { backgroundColor: '#fff9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffecf1' }, [cite: 30]
  [cite_start]cardTitle: { color: '#2c3e50', marginTop: '0' }, [cite: 30]
  [cite_start]tableSection: { marginTop: '40px' }, [cite: 30]
  [cite_start]table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' }, [cite: 31]
  [cite_start]th: { backgroundColor: '#d63384', color: 'white', padding: '12px', textAlign: 'right' }, [cite: 31]
  [cite_start]td: { padding: '12px', borderBottom: '1px solid #eee' }, [cite: 31]
  [cite_start]footerQuote: { marginTop: '50px', textAlign: 'center', padding: '30px', backgroundColor: '#2c3e50', color: 'white', borderRadius: '15px', fontSize: '1.3rem', lineHeight: '1.6' } [cite: 31]
};

export default MedicalArticle;
