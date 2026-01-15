import React from "react";

const MessageSkeleton = () => {
  const skeletonMessages = Array(8).fill(0);

  return (
    <div className="flex flex-col gap-3 p-4">
      {skeletonMessages.map((_, i) => {
        const isMine = i % 2 === 0;

        return (
          <div
            key={i}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`h-6 w-30 rounded-xl bg-base-100 dark:bg-base-300 
                          relative overflow-hidden`}
            >
              {/*  shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-base-100 via-base-200 to-base-300 animate-shimmer" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
