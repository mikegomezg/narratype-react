import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import HomePage from '@/pages/HomePage'
import PracticePage from '@/pages/PracticePage'
import TextsPage from '@/pages/TextsPage'
import StatsPage from '@/pages/StatsPage'

function Layout() {
    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b">
                <div className="container mx-auto px-4 py-3 flex items-center gap-6">
                    <Link to="/" className="text-xl font-bold">Narratype</Link>
                    <Link to="/texts"><Button variant="ghost">Library</Button></Link>
                    <Link to="/practice"><Button variant="ghost">Practice</Button></Link>
                    <Link to="/stats"><Button variant="ghost">Stats</Button></Link>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'texts', element: <TextsPage /> },
            { path: 'practice/:textId?', element: <PracticePage /> },
            { path: 'stats', element: <StatsPage /> },
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />
}