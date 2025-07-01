# TOKUTEI Learning モバイルアプリテスト手順

## 📱 Expo Go アプリでのテスト方法

### 前提条件
- スマートフォンとPCが同じWi-Fiネットワークに接続されている
- PC IP アドレス: 192.168.1.246

### 手順1: Expo Go アプリをダウンロード
- **iOS**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 手順2: アプリでの接続方法

#### iOS版 Expo Go:
1. アプリを開く
2. 下部タブの「Projects」を選択
3. 右上の「+」ボタンをタップ
4. 「Enter URL manually」を選択
5. URL入力: `exp://192.168.1.246:8081`

#### Android版 Expo Go:
1. アプリを開く
2. 「Projects」タブを選択  
3. 右上のメニュー（⋮）→「Enter URL manually」
4. URL入力: `exp://192.168.1.246:8081`

### 手順3: QRコード方式（推奨）
1. ブラウザで http://localhost:8081 を開く
2. QRコードが表示される
3. Expo Go アプリでQRコードをスキャン

### トラブルシューティング
- Wi-Fiネットワークが同じか確認
- ファイアウォール設定を確認
- IPアドレスが正しいか確認: `ifconfig`

### 期待される結果
- スマートフォンに「TOKUTEI Learning」アプリが表示される
- 「特定技能試験学習支援アプリ」のタイトルが見える
- リアルタイムでコード変更が反映される