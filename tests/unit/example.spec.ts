import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import LoginPage from "@/views/LoginPage.vue";

describe("LoginPage.vue", () => {
  test("renders LoginPage", () => {
    const wrapper = mount(LoginPage);
    expect(wrapper.text()).toMatch("Gym Assistant");
  });
});
