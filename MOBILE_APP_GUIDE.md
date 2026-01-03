# 📱 دليل تطبيق الهاتف - نظام إدارة الحملات الصحية

## 🎯 نظرة عامة

يمكن تحويل النظام الحالي إلى تطبيق هاتف باستخدام **React Native** أو **Flutter** مع الاحتفاظ بنفس قاعدة البيانات (Convex).

---

## 🚀 الخيارات المتاحة

### الخيار 1: React Native (موصى به)
**المميزات:**
- ✅ نفس لغة البرمجة (JavaScript/TypeScript)
- ✅ إعادة استخدام معظم الكود الموجود
- ✅ دعم كامل لـ Convex
- ✅ تطبيق واحد لـ iOS و Android

**الخطوات:**
```bash
# 1. تثبيت React Native CLI
npm install -g react-native-cli

# 2. إنشاء مشروع جديد
npx react-native init HealthCampaignsApp

# 3. تثبيت Convex
cd HealthCampaignsApp
npm install convex

# 4. نسخ ملفات convex/ من المشروع الحالي
cp -r ../project/convex ./

# 5. إعداد Convex
npx convex dev
```

---

### الخيار 2: Flutter
**المميزات:**
- ✅ أداء عالي جداً
- ✅ واجهة مستخدم جميلة
- ✅ تطبيق واحد لـ iOS و Android

**الخطوات:**
```bash
# 1. تثبيت Flutter
# اتبع التعليمات من: https://flutter.dev/docs/get-started/install

# 2. إنشاء مشروع جديد
flutter create health_campaigns_app

# 3. إضافة مكتبة HTTP للاتصال بـ Convex
flutter pub add http
flutter pub add web_socket_channel
```

---

## 📦 المكونات الأساسية للتطبيق

### 1. شاشة تسجيل الدخول
```typescript
// React Native Example
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.CONVEX_URL);

function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>نظام إدارة الحملات الصحية</Text>
      <TextInput placeholder="البريد الإلكتروني" />
      <TextInput placeholder="كلمة المرور" secureTextEntry />
      <Button title="تسجيل الدخول" onPress={handleLogin} />
    </View>
  );
}
```

### 2. الشاشة الرئيسية (Dashboard)
```typescript
function DashboardScreen() {
  const stats = useQuery(api.dashboard.stats);
  
  return (
    <ScrollView>
      <StatCard title="المراكز الصحية" value={stats?.healthCenters.total} />
      <StatCard title="الحملات النشطة" value={stats?.campaigns.active} />
      <StatCard title="الأنشطة" value={stats?.activities.total} />
    </ScrollView>
  );
}
```

### 3. شاشة الإحصائيات
```typescript
function StatsScreen() {
  const [data, setData] = useState({
    awarenessActivities: 0,
    healthScreenings: 0,
    vaccinations: 0,
  });

  return (
    <View>
      <Text>الإحصائيات الأسبوعية</Text>
      <NumberInput 
        label="أنشطة التوعية" 
        value={data.awarenessActivities}
        onChange={(val) => setData({...data, awarenessActivities: val})}
      />
      <Button title="حفظ" onPress={handleSave} />
    </View>
  );
}
```

---

## 🔔 الإشعارات Push Notifications

### إعداد Firebase Cloud Messaging (FCM)

```bash
# 1. تثبيت المكتبات
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging

# 2. إعداد Firebase في المشروع
# اتبع التعليمات من: https://rnfirebase.io/
```

```typescript
// إرسال إشعار عند طلب تسجيل جديد
import messaging from '@react-native-firebase/messaging';

async function sendNotification(userId: string, title: string, body: string) {
  await messaging().sendMessage({
    to: userId,
    notification: {
      title,
      body,
    },
  });
}
```

---

## 📸 مسح الباركود QR Code

```bash
# تثبيت مكتبة الباركود
npm install react-native-camera
npm install react-native-qrcode-scanner
```

```typescript
import QRCodeScanner from 'react-native-qrcode-scanner';

function QRScannerScreen() {
  const onSuccess = (e) => {
    console.log('Scanned:', e.data);
    // معالجة البيانات الممسوحة
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      topContent={<Text>امسح رمز QR للمركز الصحي</Text>}
    />
  );
}
```

---

## 🗺️ الخرائط والموقع

```bash
# تثبيت مكتبة الخرائط
npm install react-native-maps
npm install @react-native-community/geolocation
```

```typescript
import MapView, { Marker } from 'react-native-maps';

function MapScreen() {
  const centers = useQuery(api.healthCenters.list);

  return (
    <MapView
      initialRegion={{
        latitude: 35.4681,
        longitude: 44.3922,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }}
    >
      {centers?.map((center) => (
        <Marker
          key={center._id}
          coordinate={{
            latitude: center.latitude,
            longitude: center.longitude,
          }}
          title={center.name}
        />
      ))}
    </MapView>
  );
}
```

---

## 📊 الرسوم البيانية

```bash
# تثبيت مكتبة الرسوم البيانية
npm install react-native-chart-kit
npm install react-native-svg
```

```typescript
import { LineChart } from 'react-native-chart-kit';

function ChartsScreen() {
  const trends = useQuery(api.managerAnalytics.getTrends);

  return (
    <LineChart
      data={{
        labels: trends?.map(t => t.month) || [],
        datasets: [{
          data: trends?.map(t => t.totalBeneficiaries) || []
        }]
      }}
      width={Dimensions.get('window').width - 32}
      height={220}
      chartConfig={{
        backgroundColor: '#3B82F6',
        backgroundGradientFrom: '#3B82F6',
        backgroundGradientTo: '#8B5CF6',
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
    />
  );
}
```

---

## 🔐 الأمان

### 1. تخزين آمن للبيانات
```bash
npm install @react-native-async-storage/async-storage
npm install react-native-keychain
```

```typescript
import * as Keychain from 'react-native-keychain';

// حفظ بيانات الدخول بشكل آمن
await Keychain.setGenericPassword('username', 'password');

// استرجاع البيانات
const credentials = await Keychain.getGenericPassword();
```

### 2. التحقق البيومتري (بصمة/وجه)
```bash
npm install react-native-biometrics
```

```typescript
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

async function authenticateWithBiometrics() {
  const { success } = await rnBiometrics.simplePrompt({
    promptMessage: 'تأكيد الهوية'
  });
  
  if (success) {
    // السماح بالدخول
  }
}
```

---

## 📤 رفع الملفات والصور

```bash
npm install react-native-image-picker
npm install react-native-document-picker
```

```typescript
import { launchImageLibrary } from 'react-native-image-picker';

async function uploadImage() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
  });

  if (result.assets && result.assets[0]) {
    const file = result.assets[0];
    // رفع الملف إلى Convex Storage
    const uploadUrl = await generateUploadUrl();
    await fetch(uploadUrl, {
      method: 'POST',
      body: file,
    });
  }
}
```

---

## 🌐 العمل بدون إنترنت (Offline Mode)

```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
```

```typescript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// مراقبة حالة الاتصال
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    // مزامنة البيانات المحفوظة محلياً
    syncOfflineData();
  }
});

// حفظ البيانات محلياً
async function saveOffline(data) {
  await AsyncStorage.setItem('offline_data', JSON.stringify(data));
}

// مزامنة عند الاتصال
async function syncOfflineData() {
  const data = await AsyncStorage.getItem('offline_data');
  if (data) {
    // إرسال البيانات إلى Convex
    await submitData(JSON.parse(data));
    await AsyncStorage.removeItem('offline_data');
  }
}
```

---

## 🎨 التصميم والواجهة

### استخدام React Native Paper (Material Design)
```bash
npm install react-native-paper
npm install react-native-vector-icons
```

```typescript
import { Provider as PaperProvider, Button, Card } from 'react-native-paper';

function App() {
  return (
    <PaperProvider>
      <Card>
        <Card.Title title="المراكز الصحية" />
        <Card.Content>
          <Text>إجمالي المراكز: 25</Text>
        </Card.Content>
        <Card.Actions>
          <Button>عرض التفاصيل</Button>
        </Card.Actions>
      </Card>
    </PaperProvider>
  );
}
```

---

## 🚀 النشر

### نشر على Google Play Store
```bash
# 1. إنشاء ملف APK
cd android
./gradlew assembleRelease

# 2. الملف الناتج في:
# android/app/build/outputs/apk/release/app-release.apk
```

### نشر على Apple App Store
```bash
# 1. فتح Xcode
open ios/HealthCampaignsApp.xcworkspace

# 2. اختيار Product > Archive
# 3. رفع إلى App Store Connect
```

---

## 📋 قائمة المهام

- [ ] إعداد مشروع React Native
- [ ] دمج Convex
- [ ] تصميم الشاشات الأساسية
- [ ] إضافة الإشعارات
- [ ] إضافة مسح الباركود
- [ ] إضافة الخرائط
- [ ] إضافة الرسوم البيانية
- [ ] اختبار على Android
- [ ] اختبار على iOS
- [ ] النشر على المتاجر

---

## 💡 نصائح مهمة

1. **ابدأ بسيط**: ابدأ بالشاشات الأساسية ثم أضف المميزات تدريجياً
2. **اختبر كثيراً**: اختبر على أجهزة حقيقية وليس فقط المحاكي
3. **الأداء**: راقب استهلاك البطارية والذاكرة
4. **الأمان**: لا تخزن بيانات حساسة بدون تشفير
5. **التحديثات**: استخدم CodePush للتحديثات السريعة

---

## 📞 الدعم الفني

للمساعدة في تطوير التطبيق:
- React Native: https://reactnative.dev/docs/getting-started
- Convex: https://docs.convex.dev/
- Firebase: https://firebase.google.com/docs

---

**ملاحظة:** هذا دليل شامل لتحويل النظام إلى تطبيق هاتف. يمكن البدء بالمميزات الأساسية ثم إضافة المميزات المتقدمة تدريجياً.
