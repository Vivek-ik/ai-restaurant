import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Orders from "./pages/Orders";
import MenuPage from "./pages/MenuPage";
import QRScanner from "./pages/QrScannerPage";
import Cart from "./components/cart";
import CustomizationPage from "./pages/CustomerOrder";
import OrderPlaced from "./pages/orderPlaced";
import MenuByCategory from "./pages/Categories";
import BulkUploader from "./pages/BulkMenu";
import MainAiPage from "./pages/MainAiPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* <Route index path="/" element={<Home />} /> */}

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-with-ai/:tableId" element={<CustomizationPage />} />
            {/* <Route path="/qr-code-scan" element={<QRScanner />} /> */}

            {/* for now we are using QRScanner as the main page */}
            <Route path="/" element={<QRScanner />} />
            <Route path="/menu/:tableId" element={<MenuPage />} />
            <Route path="/categories/:tableId" element={<MenuByCategory />} />

            <Route path="/bulkedit" element={<BulkUploader />} />

            <Route path="/cart/:tableId" element={<Cart />} />
            <Route path="/order-placed" element={<OrderPlaced />} />
            <Route path="/main-ai-page/:tableId" element={<MainAiPage />} />

            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
