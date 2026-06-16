import { Link } from 'react-router';

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-neutral-800 p-6 text-center">
      <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
      <div className="bg-primary text-white px-3 py-1 text-sm rounded rotate-12 absolute mb-28">
        Không tìm thấy trang
      </div>
      <div className="mt-6">
        <p className="text-xl md:text-2xl font-semibold mb-2">Đường dẫn bạn truy cập không tồn tại</p>
        <p className="text-neutral-500 max-w-md mb-8">
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ để tiếp tục sử dụng hệ thống ClassManager.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 ease-in-out cursor-pointer select-none active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 px-5 py-2.5 text-base bg-primary text-white hover:bg-primary-hover shadow-sm"
        >
          Quay lại Trang Chủ
        </Link>
      </div>
    </div>
  );
}
