import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuantityStepper } from '@/components/quotation/quantity-stepper'

function setup(value = 12, onChange = vi.fn()) {
  render(
    <QuantityStepper
      value={value}
      min={12}
      unit="un"
      label="Shiitake"
      onChange={onChange}
    />,
  )
  return { onChange }
}

describe('QuantityStepper', () => {
  it('increments from the current value', async () => {
    const user = userEvent.setup()
    const { onChange } = setup(12)

    await user.click(screen.getByRole('button', { name: 'Aumentar quantidade de Shiitake' }))

    expect(onChange).toHaveBeenCalledWith(13)
  })

  it('disables the decrement button at the minimum', () => {
    setup(12)

    expect(
      screen.getByRole('button', { name: 'Diminuir quantidade de Shiitake' }),
    ).toBeDisabled()
  })

  it('decrements but never below the minimum', async () => {
    const user = userEvent.setup()
    const { onChange } = setup(13)

    await user.click(screen.getByRole('button', { name: 'Diminuir quantidade de Shiitake' }))

    expect(onChange).toHaveBeenCalledWith(12)
  })

  it('clamps a typed value below the minimum on blur', async () => {
    const user = userEvent.setup()
    const { onChange } = setup(20)
    const input = screen.getByRole('textbox', { name: /Quantidade de Shiitake/ })

    await user.clear(input)
    await user.type(input, '3')
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(12)
    expect(input).toHaveValue('12')
  })

  it('keeps a typed value above the minimum', async () => {
    const user = userEvent.setup()
    const { onChange } = setup(12)
    const input = screen.getByRole('textbox', { name: /Quantidade de Shiitake/ })

    await user.clear(input)
    await user.type(input, '48')
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(48)
  })

  it('falls back to the minimum when the input is emptied', async () => {
    const user = userEvent.setup()
    const { onChange } = setup(20)
    const input = screen.getByRole('textbox', { name: /Quantidade de Shiitake/ })

    await user.clear(input)
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(12)
  })
})
