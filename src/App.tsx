import {
  createTheme,
  ThemeProvider
} from "@mui/material/styles"
import {
  Container,
  CssBaseline,
} from "@mui/material";
import { CSSProperties } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { useState } from "react";

import {
  Navbar,
  Footer
} from "./components";
import {
  Main,
  SignUp,
  Login,
  AllSeries,
  OneSeries,
  OneSeason,
  OneEpisode,

  AdminPanel,

  ManageSeries,
  UpsertSeries,

  ManageTags,
  UpsertTag,

  ManageSeasons,
  UpsertSeason,

  ManageEpisodes,
  UpsertEpisode,

  NotFound
} from "./pages"

import "./App.css"

const themes = {
  light: createTheme(
    {
      palette: {
        mode: "light"
      }
    }
  ),

  dark: createTheme(
    {
      palette: {
        mode: "dark"
      }
    }
  )
}

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>(localStorage.getItem("theme") as Theme || "light");

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const containerStyle: CSSProperties = {
    minHeight: "74.5vh",
    marginTop: 96,
    marginBottom: 64,
    position: "relative"
  };

  return (
    <>
      <ThemeProvider theme={themes[theme]}>
        <BrowserRouter>
          <CssBaseline />
          <Navbar handleThemeChange={handleThemeChange} />

          <Container style={containerStyle}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/series" element={<AllSeries />} />
              <Route path="/series/:id" element={<OneSeries />} />
              <Route path="/seasons/:id" element={<OneSeason />}/>
              <Route path="/episodes/:id" element={<OneEpisode />} />

              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/series" element={<ManageSeries />} />
              <Route path="/admin/series/:id" element={<UpsertSeries />} />
              <Route path="/admin/tags" element={<ManageTags />} />
              <Route path="/admin/tags/:id" element={<UpsertTag />} />
              <Route path="/admin/seasons" element={<ManageSeasons />} />
              <Route path="/admin/seasons/:id" element={<UpsertSeason />} />
              <Route path="/admin/episodes" element={<ManageEpisodes />} />
              <Route path="/admin/episodes/:id" element={<UpsertEpisode />} />

              <Route path="/*" element={<NotFound />} />
            </Routes>
          </Container>

          <Footer />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
