import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { mailboxApi } from '@/api/resources';

export function useMailboxesQuery(all = false) {
  return useQuery({
    queryKey: queryKeys.mailboxes.list(all ? 'all' : 'mine'),
    queryFn: () => mailboxApi.list(all),
  });
}

/** 分享给我的管理员邮箱。只用于收件筛选，不进入发件身份。 */
export function useSharedMailboxesQuery() {
  return useQuery({
    queryKey: queryKeys.mailboxes.shared,
    queryFn: () => mailboxApi.shared(),
  });
}
