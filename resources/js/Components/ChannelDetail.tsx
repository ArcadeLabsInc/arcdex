import * as React from 'react'
import { Link } from '@inertiajs/react'

export const ChannelDetail = ({ channel }) => {
  return (
    <Link href={`/channel/${channel.id}`}>
      <button
        id={`#channel-detail-${channel.id}`}
        className="w-full group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-white focus:outline-none"
      >
        <div className="mr-3 w-4 h-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4 opacity-75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </div>
        <p className="text-left text-sm line-clamp-1">{channel.title}</p>
      </button>
    </Link>
  )
}
