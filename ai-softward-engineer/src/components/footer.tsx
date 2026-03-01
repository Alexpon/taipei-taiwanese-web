export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Association Info */}
          <div>
            <h3 className="text-lg font-bold">台北市台灣語協會</h3>
            <p className="mt-2 text-sm text-gray-400">
              推廣台灣語言文化教育，傳承母語之美
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold">聯絡資訊</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>地址：台北市（待更新）</li>
              <li>電話：（待更新）</li>
              <li>Email：（待更新）</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} 台北市台灣語協會. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
