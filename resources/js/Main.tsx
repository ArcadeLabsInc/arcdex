import * as React from 'react'
import { Fragment, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  broadcastToRelay,
  Connect,
  connectToRelay,
  ConnectURI,
} from '@nostr-connect/connect'
import {
  Bars3BottomLeftIcon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Message } from './Message'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

// import inertia
import { useForm } from '@inertiajs/react'
import { Event, getEventHash } from 'nostr-tools'
import { useStore } from './store'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const messages = [
  {
    id: '1',
    user: 'Alice',
    text: 'Hello',
    time: '08:42PM', //'2021-03-10T15:34:00.000000Z',
    unread: false,
  },
  {
    id: '2',
    user: 'Bob',
    text: 'Hi, Alice!',
    time: '08:43PM', //'2021-03-10T15:34:30.000000Z',
    unread: true,
  },
  {
    id: '3',
    user: 'Carol',
    text: 'Hey everyone!',
    time: '08:44PM', //'2021-03-10T15:35:00.000000Z',
    unread: true,
  },
  {
    id: '4',
    user: 'Dave',
    text: 'Whats up?',
    time: '08:45PM', //'2021-03-10T15:35:30.000000Z',
    unread: false,
  },
  {
    id: '5',
    user: 'Eve',
    text: 'Not much, you?',
    time: '08:46PM', //'2021-03-10T15:36:00.000000Z',
    unread: false,
  },
  {
    id: '6',
    user: 'Frank',
    text: 'Just hanging out',
    time: '08:47PM', //'2021-03-10T15:36:30.000000Z',
    unread: true,
  },
  {
    id: '7',
    user: 'George',
    text: 'Cool',
    time: '08:48PM', //'2021-03-10T15:37:00.000000Z',
    unread: false,
  },
  {
    id: '8',
    user: 'Hannah',
    text: 'What have you been up to?',
    time: '08:49PM', //'2021-03-10T15:37:30.000000Z',
    unread: true,
  },
  {
    id: '9',
    user: 'Ivan',
    text: 'Just catching up on some work',
    time: '08:50PM', //'2021-03-10T15:38:00.000000Z',
    unread: false,
  },
  {
    id: '10',
    user: 'Julie',
    text: 'Sounds fun!',
    time: '08:51PM', //'2021-03-10T15:38:30.000000Z',
    unread: false,
  },
  {
    id: '11',
    user: 'Kevin',
    text: 'Yeah, not too bad',
    time: '08:52PM', //'2021-03-10T15:39:00.000000Z',
    unread: true,
  },
  {
    id: '12',
    user: 'Liz',
    text: 'How about you?',
    time: '08:53PM', //'2021-03-10T15:39:30.000000Z',
    unread: true,
  },
  {
    id: '13',
    user: 'Mark',
    text: 'Just finished up a project',
    time: '08:54PM', //'2021-03-10T15:40:00.000000Z',
    unread: false,
  },
  {
    id: '14',
    user: 'Nina',
    text: 'Congrats!',
    time: '08:55PM', //'2021-03-10T15:40:30.000000Z',
    unread: false,
  },
]

// const channels = [
//   {
//     id: '12345',
//     name: 'Nostr',
//     current: true,
//     lastMessageTime: '08:42PM', //'2021-03-10T15:34:00.000000Z',
//     lasttext: 'review my NIPs',
//     unread: 0,
//     author: 'Alice',
//   },
//   {
//     id: '67890',
//     name: 'Arc',
//     current: false,
//     lastMessageTime: '06:51PM', //'2021-03-10T15:34:00.000000Z',
//     lasttext: 'nice app',
//     unread: 0,
//     author: 'Bob',
//   },
//   {
//     id: '412312',
//     name: 'Faerie',
//     current: false,
//     lastMessageTime: '04:51PM', //'2021-03-10T15:34:00.000000Z',
//     lasttext: 'Here is the report you asked for.',
//     unread: 0,
//     author: null,
//   },
//   {
//     id: '67890',
//     name: 'Satoshi Nakamoto',
//     current: false,
//     lastMessageTime: '06:51PM', //'2021-03-10T15:34:00.000000Z',
//     lasttext: 'have some bitcoin',
//     unread: 0,
//     author: null,
//   },
// ]

const navigation = [
  //   { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  //   { name: 'Team', href: '#', icon: UsersIcon, current: false },
  //   { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  //   { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
  //   { name: 'Documents', href: '#', icon: InboxIcon, current: false },
  //   { name: 'Reports', href: '#', icon: ChartBarIcon, current: false },
]
const userNavigation = [
  //   { name: 'Your Profile', href: '#' },
  //   { name: 'Settings', href: '#' },
  //   { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function ChatDemo({ channels }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    eventid: '',
    relayurl: '',
  })

  const connect = useStore((state) => state.connect)

  const createChannel = async (e) => {
    e.preventDefault()
    if (!connect) {
      console.log('no connect')
      return
    }
    let chan = {}
    chan['about'] = 'A demo channel'
    chan['name'] = data.title
    chan['picture'] = 'https://placekitten.com/200/200'
    const now = Math.floor(Date.now() / 1000)
    const note = JSON.stringify(chan)
    let event: Event = {
      content: note,
      created_at: now,
      kind: 40,
      tags: [],
      pubkey:
        '696da2ff3bab02510a3e4a5b70d370140774e174f3a0ebf5d2dc8a376d1232ec',
    }
    event.id = getEventHash(event)
    event.sig = await connect.signEvent(event)
    const relayurl = 'wss://arc1.arcadelabs.co'
    const relay = await connectToRelay(relayurl)
    await broadcastToRelay(relay, event, true)

    data.eventid = event.id
    data.relayurl = relayurl

    post('/api/channels')
  }

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  <a href="/">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </a>
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="space-y-1 px-2">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-gray-300'
                              : 'text-gray-400 group-hover:text-gray-300',
                            'mr-4 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <div className="flex h-16 flex-shrink-0 items-center bg-gray-900 px-4">
            <a href="/">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                alt="Your Company"
              />
            </a>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              <form onSubmit={createChannel}>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
                {errors.title && (
                  <div className="text-sm text-red-500">{errors.title}</div>
                )}
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Channel
                </button>
              </form>

              {channels.map((channel) => (
                <a
                  key={channel.id}
                  href={`chat/${channel.id}`}
                  className={classNames(
                    channel.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'flex-row group flex items-start px-2 py-2 text-md rounded-md justify-between'
                  )}
                >
                  <div className="flex-col">
                    <p className="font-bold mb-1">{channel.title}</p>
                    <p className="line-clamp-1">
                      {channel.author}
                      {channel.author ? ': ' : ''} {channel.lasttext}
                    </p>
                  </div>
                  <p className="opacity-50 text-sm">
                    {channel.lastMessageTime}
                  </p>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-900 shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <form className="flex w-full md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <MagnifyingGlassIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="search-field"
                    className="dark:bg-gray-900 block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Search"
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* <h1 className="text-2xl font-semibold text-gray-900">
                  Chatroom 1
                </h1> */}
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* Replace with your content */}
              <div className="py-4">
                {/* <div className="h-96 rounded-lg border-4 border-dashed border-gray-200" /> */}
                {messages.map((message) => (
                  <Message message={message} key={message.id} />
                ))}
              </div>
              {/* /End replace */}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
