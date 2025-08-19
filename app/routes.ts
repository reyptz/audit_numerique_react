import type { RouteConfig } from "@react-router/dev/routes";

const routes: RouteConfig = [
  {
    id: "root-layout",
    file: "root.tsx",
    children: [
      { 
        id: "home",
        index: true, 
        file: "routes/home.tsx" 
      },
      { 
        id: "welcome",
        path: "welcome", 
        file: "welcome/welcome.tsx" 
      },
      { 
        id: "login",
        path: "login", 
        file: "routes/login.tsx" 
      },
      { 
        id: "register",
        path: "register", 
        file: "routes/register.tsx" 
      },
      { path: "forgot-password", file: "routes/forgot-password.tsx" },
      { path: "reset-password/:token",  file: "routes/reset-password.tsx" },
      {
        id: "protected",
        path: "app",
        file: "components/Protected.tsx",
        children: [
          {
            id: "dashboard-shell",
            file: "layouts/DashboardShell.tsx",
            children: [
              { 
                id: "dashboard",
                index: true, 
                file: "dashboard/index.tsx" 
              },
              { 
                id: "members",
                path: "members", 
                file: "./members/index.tsx" 
              },
              { 
                id: "cotisations",
                path: "cotisations", 
                file: "cotisations/index.tsx" 
              },
              { 
                id: "cooperatives",
                path: "cooperatives", 
                file: "cooperatives/index.tsx" 
              },
              { 
                id: "evenements",
                path: "evenements", 
                file: "evenements/index.tsx" 
              },
              { 
                id: "prets",
                path: "prets", 
                file: "prets/index.tsx" 
              },
              { 
                id: "remboursements",
                path: "remboursements", 
                file: "remboursements/index.tsx" 
              },
              { 
                id: "transactions",
                path: "transactions", 
                file: "transactions/index.tsx" 
              },
              { 
                id: "notifications",
                path: "notifications", 
                file: "notifications/index.tsx" 
              },
              { 
                id: "chat",
                path: "chat", 
                file: "chat/index.tsx" 
              },
              { id: "audits", path: "audits", file: "audits/index.tsx" },
              { id: "profile", path: "profile", file: "profile/index.tsx" },
              { id: "messages", path: "messages", file: "messages/index.tsx" },
            ]
          }
        ]
      },
      { 
        id: "not-found",
        path: "*", 
        file: "routes/not-found.tsx" 
      }
    ]
  }
];

export default routes;