/**
 * @jest-environment jsdom
 */
import { toBeInTheDocument } from '@testing-library/jest-dom'
import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills.js'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {  
  describe("When I am on Bills Page", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
  
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    
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
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      const handleClickNewBillFunction = jest.fn(() => BillsDatas.handleClickNewBill())

      const icon = screen.getByTestId('btn-new-bill')

      icon.addEventListener('click', handleClickNewBillFunction)
      await waitFor(() => userEvent.click(icon))
      expect(handleClickNewBillFunction).toHaveBeenCalled()
    })

    test("When I click on 'eye icon' the modal show up", async () => {
      const BillsDatas = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })
      // Need to emulate jquery/bootstrap modal
      $.fn.modal = jest.fn();

      const icon = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEyeFunction = jest.fn(() => BillsDatas.handleClickIconEye(icon))

      icon.addEventListener('click', handleClickIconEyeFunction)
      userEvent.click(icon)
      expect(icon).toHaveAttribute('data-bill-url')
      expect(handleClickIconEyeFunction).toHaveBeenCalled()
    })

    test("On page load, bills informations are valid", async () => {  
      setBillsTestPage()

      document.body.innerHTML = BillsUI({ data: bills })

      const body = screen.getByTestId('tbody')
      expect(body).toBeInTheDocument()
      const rows = document.querySelectorAll('tr')
      expect(rows).toHaveLength(5)
      const row1 = rows[1].querySelectorAll('td')
      expect(row1[2].textContent).toBe("2004-04-04")
      expect(row1[4].textContent).toBe("pending")
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as an Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()

      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Nouvelle note de frais"))
      const BillsType  = await screen.getByText("Type")
      expect(BillsType).toBeTruthy()
      const BillsName  = await screen.getByText("Nom")
      expect(BillsName).toBeTruthy()
      const BillsDate  = await screen.getByText("Date")
      expect(BillsDate).toBeTruthy()
      const BillsAmount  = await screen.getByText("Montant")
      expect(BillsAmount).toBeTruthy()
      const BillsStatut  = await screen.getByText("Statut")
      expect(BillsStatut).toBeTruthy()
      const BillsActions  = await screen.getByText("Actions")
      expect(BillsActions).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeInTheDocument()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

/* test("On page load, bills informations are valid", async () => {  
  const BillsInstance = new Bills({
    document, onNavigate, store: bills, localStorage: window.localStorage
  })

  const spy = jest.spyOn(BillsInstance, 'getBills').mockImplementation(() => bills)
  const billsDatas = await BillsInstance.getBills()

  document.body.innerHTML = BillsUI({ data: billsDatas })
  console.log(billsDatas);
  expect(billsDatas).toBe(bills)

  spy.mockRestore()
}) */