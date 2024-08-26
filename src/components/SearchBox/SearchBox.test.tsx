import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { MemoryRouter, useNavigate } from "react-router-dom";
import SearchBox from "./SearchBox";
import "@testing-library/jest-dom";
import { RootState } from "../../store";
import { setSearchQuery } from "../../store/jobs/jobsSlice";

type MockStore = MockStoreEnhanced<RootState, {}>;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("lodash/debounce", () => jest.fn((fn) => fn));

describe("SearchBox Component", () => {
  let store: MockStore;
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    store = configureStore<RootState>([])({
      jobs: {
        searchQuery: "",
        entities: {
          jobs: {},
          skills: {},
        },
        loading: false,
        error: null,
        count: 0,
        next: 0,
        searchHistory: [],
        cursor: 0,
      },
    });

    mockNavigate.mockClear();
  });

  it("should render the search input and icon", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBox />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/search keyword/i)).toBeInTheDocument();
    expect(screen.getByAltText(/search/i)).toBeInTheDocument();
  });

  it("should dispatch setSearchQuery on input change", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBox />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/search keyword/i);
    fireEvent.change(input, { target: { value: "developer" } });

    const actions = store.getActions();
    expect(actions).toContainEqual(setSearchQuery("developer"));
  });

  it("should display autocomplete suggestions when query is >= 3 characters", () => {
    store = configureStore<RootState>([])({
      jobs: {
        searchQuery: "dev",
        entities: {
          jobs: {
            1: { id: "1", title: "Developer", skills: ["skill1"] },
            2: { id: "2", title: "Designer", skills: ["skill2"] },
          },
          skills: {},
        },
        loading: false,
        error: null,
        count: 2,
        next: 0,
        searchHistory: [],
        cursor: 0,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBox />
        </MemoryRouter>
      </Provider>
    );

    const suggestionItems = screen.getAllByRole("listitem");
    expect(suggestionItems.length).toBe(2);
    expect(suggestionItems[0]).toHaveTextContent("Developer");
    expect(suggestionItems[1]).toHaveTextContent("Designer");
  });
});
