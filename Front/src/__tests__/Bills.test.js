/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from '../containers/Bills.js'

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  describe("When I am on Bills Page", () => {
    const setBillsTestPage = () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      
      router()
      
      window.onNavigate(ROUTES_PATH.Bills)
    }
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      setBillsTestPage()

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.className).toEqual("active-icon") 
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })

    test("When I click on 'new bill' I am redirected to new bill page", async () => {
      const BillsDatas = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      const handleClickNewBillFunction = jest.fn(() => BillsDatas.handleClickNewBill())

      const icon = screen.getByTestId('btn-new-bill')

      icon.addEventListener('click', handleClickNewBillFunction)
      userEvent.click(icon)
      expect(handleClickNewBillFunction).toHaveBeenCalled()
    })

    test("When I click on 'eye icon' the modal show up", async () => {
      const BillsDatas = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })
      /* Need to emulate jquery/bootstrap modal */
      $.fn.modal = jest.fn();

      const icon = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEyeFunction = jest.fn(() => BillsDatas.handleClickIconEye(icon))

      icon.addEventListener('click', handleClickIconEyeFunction)
      userEvent.click(icon)
      expect(handleClickIconEyeFunction).toHaveBeenCalled()
    })

    test("On page load, bills informations are valid", async () => {  

    })
  })
})