import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Mailbox } from '@hpc-mail/shared';
import { IdentityPicker, type IdentityPickerProps } from './identity-picker';

beforeAll(() => {
  Element.prototype.scrollIntoView ??= () => {};
});

const box = (id: number, address: string) => ({ id, address }) as Mailbox;
const MAILBOXES = [box(1, 'zed@b.test'), box(2, 'amy@c.test'), box(3, 'bob@a.test')];

function show(patch: Partial<IdentityPickerProps> = {}) {
  const props: IdentityPickerProps = {
    isAdmin: false,
    mailboxes: MAILBOXES,
    domains: ['c.test', 'a.test', 'b.test'],
    mailboxId: null,
    onMailboxId: vi.fn(),
    localPart: '',
    onLocalPart: vi.fn(),
    domain: 'c.test',
    onDomain: vi.fn(),
    id: 'from',
    ...patch,
  };
  render(<IdentityPicker {...props} />);
  return props;
}

const optionNames = () => within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.textContent);

describe('IdentityPicker', () => {
  it('普通用户的发件地址按字典序排列，可搜索后选择', () => {
    const props = show();
    fireEvent.click(screen.getByRole('combobox', { name: /发件地址/ }));
    expect(optionNames()).toEqual(['amy@c.test', 'bob@a.test', 'zed@b.test']);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'b.test' } });
    expect(optionNames()).toEqual(['zed@b.test']);
    fireEvent.click(screen.getByRole('option', { name: 'zed@b.test' }));
    expect(props.onMailboxId).toHaveBeenCalledWith(1);
  });

  it('管理员：「自定义发件地址」置顶，其后的邮箱与发件域名都按字典序', () => {
    const props = show({ isAdmin: true });
    fireEvent.click(screen.getByRole('combobox', { name: /发件身份/ }));
    expect(optionNames()).toEqual(['自定义发件地址', 'amy@c.test', 'bob@a.test', 'zed@b.test']);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });

    fireEvent.click(screen.getByRole('combobox', { name: '发件域名' }));
    expect(optionNames()).toEqual(['a.test', 'b.test', 'c.test']);
    fireEvent.click(screen.getByRole('option', { name: 'a.test' }));
    expect(props.onDomain).toHaveBeenCalledWith('a.test');
  });
});
