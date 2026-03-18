export const ChatLoader = () => (
  <div className="h-screen flex flex-col bg-white">
    <div className="px-4 pr-2 py-3 bg-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-300 rounded animate-pulse w-32" />
        </div>
      </div>
    </div>
    <div className="flex-1" />
    <div className="px-3 pb-0 pt-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 border-1 relative rounded-lg">
          <div className="flex items-end gap-2 p-1 h-10">
            <div className="w-full flex-1 relative">
              <div className="h-0 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="py-4 text-center flex justify-center items-center gap-0">
      <div className="h-2 bg-gray-200 rounded animate-pulse w-32" />
    </div>
  </div>
);
