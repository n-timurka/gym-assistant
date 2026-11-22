import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import WeekNavigation from '@/components/WeekNavigation.vue';
import { getWeekDisplay, getEndOfWeek } from '@/helpers/date.helper';

describe('WeekNavigation.vue', () => {
  const baseDate = new Date(2026, 10, 16); // Monday, Nov 16, 2026

  it('renders the formatted week display header', () => {
    const wrapper = mount(WeekNavigation, {
      props: {
        modelValue: baseDate,
      },
      global: {
        stubs: {
          IonButton: {
            template: '<button class="ion-button-stub" @click="$emit(\'click\')"><slot /><slot name="icon-only" /></button>',
          },
          IonIcon: true,
        },
      },
    });

    const expectedHeader = getWeekDisplay(baseDate, getEndOfWeek(baseDate));
    expect(wrapper.find('h2').text()).toBe(expectedHeader);
  });

  it('emits updated date 7 days earlier when previous week button is clicked', async () => {
    const wrapper = mount(WeekNavigation, {
      props: {
        modelValue: baseDate,
      },
      global: {
        stubs: {
          IonButton: {
            template: '<button class="ion-button-stub" @click="$emit(\'click\')"><slot /><slot name="icon-only" /></button>',
          },
          IonIcon: true,
        },
      },
    });

    const buttons = wrapper.findAll('.ion-button-stub');
    await buttons[0].trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toBeInstanceOf(Date);

    const emittedDate = emitted![0][0] as Date;
    expect(emittedDate.getDate()).toBe(9);
    expect(emittedDate.getMonth()).toBe(10);
  });

  it('emits updated date 7 days later when next week button is clicked', async () => {
    const wrapper = mount(WeekNavigation, {
      props: {
        modelValue: baseDate,
      },
      global: {
        stubs: {
          IonButton: {
            template: '<button class="ion-button-stub" @click="$emit(\'click\')"><slot /><slot name="icon-only" /></button>',
          },
          IonIcon: true,
        },
      },
    });

    const buttons = wrapper.findAll('.ion-button-stub');
    await buttons[1].trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const emittedDate = emitted![0][0] as Date;
    expect(emittedDate.getDate()).toBe(23);
    expect(emittedDate.getMonth()).toBe(10);
  });
});
