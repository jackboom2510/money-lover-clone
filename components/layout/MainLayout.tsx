import React, { ReactNode } from 'react'

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      {children}
    </div>
  )
}

export default MainLayout
