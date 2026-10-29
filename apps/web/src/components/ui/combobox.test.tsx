import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from './combobox';

beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
});

const OPTIONS: ComboboxOption[] = [
  { value: '1', label: 'alpha@a.test' },
  { value: '2', label: 'beta@b.test', description: '共享自 carol' },
  { value: '3', label: 'gamma@a.test' },
];

function Harness({ onChange = vi.fn() }: { onChange?: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>('3');
  return (
    <Combobox
      aria-label="选择地址"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
      options={OPTIONS}
      clearable={false}
    />
  );
}

const optionNames = () => within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.textContent);

describe('Combobox', () => {
  it('触发器暴露 combobox 语义，展开时显示搜索框并按传入顺序列出全部选项', () => {
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: '选择地址' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('gamma@a.test');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(optionNames()).toEqual(['alpha@a.test', 'beta@b.test共享自 carol', 'gamma@a.test']);
  });

  it('按标签和说明不区分大小写过滤，不按内部 value 匹配', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('combobox', { name: '选择地址' }));
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'A.TEST' } });
    expect(optionNames()).toEqual(['alpha@a.test', 'gamma@a.test']);
    fireEvent.change(search, { target: { value: 'carol' } });
    expect(optionNames()).toEqual(['beta@b.test共享自 carol']);
    fireEvent.change(search, { target: { value: '2' } });
    expect(screen.queryByRole('option')).toBeNull();
    expect(screen.getByText('无匹配项')).toBeInTheDocument();
  });

  it('打开时高亮当前值，方向键与回车选择后关闭', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: '选择地址' });
    fireEvent.click(trigger);
    const search = screen.getByRole('searchbox');
    fireEvent.keyDown(search, { key: 'ArrowUp' });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('2');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger).toHaveTextContent('beta@b.test');
  });
});
