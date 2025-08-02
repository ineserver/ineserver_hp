export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
        {/* フッター下部 */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2024 いねさば. All rights reserved.
          </div>
          <div className="text-sm text-gray-400">
            Minecraft は Mojang Studios の商標です
          </div>
        </div>
      </div>
    </footer>
  );
}
