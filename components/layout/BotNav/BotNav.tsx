import React from 'react'
import { SidebarItems } from '../Sidebar/MainSidebar'
import BotNavItem from './BotNavItem'

const BotNav = () => {
  return (
    <div className="grid grid-cols-4 gap-2 sticky bottom-4 mx-2 w-auto items-center justify-items-center bg-glass rounded-lg backdrop-blur-lg p-2 z-50 mt-5">
        {SidebarItems.filter(item => item.showInBotNav).map((item) => (
          <BotNavItem key={item.url} item={item} />
        ))}
    </div>
  )
}

export default BotNav