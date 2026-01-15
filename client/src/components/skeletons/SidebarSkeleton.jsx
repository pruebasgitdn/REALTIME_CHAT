import React from "react";
import { TiUser } from "react-icons/ti";

const SidebarSkeleton = () => {
  const exampleContacts = Array.from({ length: 6 }, (_, i) => i);

  return (
    <aside
      className="h-screen   border-r  flex flex-col 
    w-20 lg:w-72 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b ">
        <div className="flex items-center gap-3">
          <TiUser className="text-2xl" />
          <span className="hidden lg:inline font-medium">Contactos</span>
        </div>
      </div>

      {/* Contact list */}
      <div className="overflow-y-auto flex-1">
        {exampleContacts.map((m) => (
          <div key={m} className="flex items-center gap-3 p-3 cursor-pointer">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full"></div>

            {/* Contact info */}
            <div className="hidden lg:flex flex-col">
              <span className="font-medium ">Usuario {m + 1}</span>
              <span className="text-sm">Último mensaje...</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
