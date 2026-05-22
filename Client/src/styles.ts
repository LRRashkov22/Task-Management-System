export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const iconSvg =
  '[&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]'

const panel =
  'border border-[#edf0f4] bg-white shadow-[0_3px_7px_rgba(17,24,39,0.08)]'

export const loginStyles = {
  page: 'grid min-h-[100svh] place-items-center bg-[#edf3ff] px-6 py-12 font-[Arial,sans-serif] max-[520px]:p-5',
  panel:
    'box-border w-[min(100%,594px)] rounded-xl bg-white px-[43px] pt-11 pb-[42px] shadow-[0_12px_28px_rgba(31,41,55,0.14)] max-[520px]:px-[22px] max-[520px]:py-[30px]',
  title:
    'mb-[34px] text-center text-[28px] leading-[1.2] font-bold text-[#111] max-[520px]:mb-7 max-[520px]:text-[26px]',
  form: 'grid',
  label:
    'mb-2 block text-[20px] leading-[1.2] font-bold text-[#151515] max-[520px]:text-[18px]',
  input:
    'mb-6 box-border h-[55px] w-full rounded-xl border-2 border-[#d9dde5] bg-white px-3.5 py-2.5 text-[18px] leading-[1.3] text-[#111827] focus:border-[#aeb8ce] focus:outline-[3px] focus:outline-[rgba(47,95,238,0.16)]',
  message: 'mt-[-8px] mb-3.5 text-center text-[15px] font-semibold',
  submit:
    'mt-[-2px] h-[54px] w-full cursor-pointer rounded-[10px] border-0 bg-[#315af2] text-[20px] leading-[1.2] font-bold text-white hover:not-disabled:bg-[#254be0] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgba(49,90,242,0.3)] disabled:cursor-not-allowed disabled:opacity-72 max-[520px]:text-[18px]',
  demo:
    'mt-0 rounded-[10px] border border-[#b9d7ff] bg-[#eef6ff] px-4 py-[18px] text-[16px] leading-[1.28] font-semibold text-[#24272f] max-[520px]:text-[14px] [&_p]:mb-3',
}

export const commonStyles = {
  iconSvg,
  message: (type: 'error' | 'success') =>
    cx(type === 'error' ? 'text-[#b91c1c]' : 'text-[#047857]'),
  priority: (tone: string) =>
    cx(
      'shrink-0 rounded px-2 py-1 text-[12px] leading-none font-semibold',
      tone === 'high' && 'bg-[#fee2e2] text-[#dc2626]',
      tone === 'medium' && 'bg-[#dfeaff] text-[#315af2]',
      tone === 'low' && 'bg-[#dcfce7] text-[#15803d]',
    ),
  status: (tone: string) =>
    cx(
      'rounded px-2 py-1 text-[12px] leading-none font-semibold',
      tone === 'inprogress' && 'bg-[#dfeaff] text-[#315af2]',
      tone === 'review' && 'bg-[#fff4bf] text-[#9a6700]',
      tone === 'done' && 'bg-[#d1fae5] text-[#047857]',
      tone === 'todo' && 'bg-[#f3f4f6] text-[#374151]',
    ),
  avatar:
    'inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dbeafe] text-[14px] font-bold text-[#1f2937]',
}

export const adminStyles = {
  shell: (open: boolean) =>
    cx(
      'grid min-h-[100svh] bg-[#f8f9fb] font-[Arial,sans-serif] text-left text-[#111827] transition-[grid-template-columns] duration-[260ms]',
      open ? 'grid-cols-[255px_1fr] max-[1180px]:grid-cols-[235px_1fr] max-[760px]:grid-cols-1' : 'grid-cols-[0_1fr] max-[760px]:grid-cols-1',
    ),
  sidebar: (open: boolean) =>
    cx(
      'flex min-h-[100svh] flex-col overflow-hidden border-r border-[#e4e7ec] bg-white transition-[opacity,transform,border-color,max-height] duration-[260ms] max-[760px]:min-h-0 max-[760px]:border-r-0',
      open
        ? 'opacity-100 translate-x-0 max-[760px]:max-h-[430px]'
        : 'pointer-events-none -translate-x-6 border-r-transparent opacity-0 max-[760px]:max-h-0 max-[760px]:-translate-y-3 max-[760px]:translate-x-0',
    ),
  sidebarInner: (open: boolean) =>
    cx('min-w-[255px] transition-opacity duration-180 max-[1180px]:min-w-[235px]', !open && 'opacity-0'),
  brand:
    'border-b border-[#e4e7ec] px-[18px] py-5 max-[760px]:p-[22px] [&_h1]:mb-2 [&_h1]:text-[22px] [&_h1]:leading-none [&_h1]:font-extrabold [&_h1]:text-[#2f63f4] [&_p]:block [&_p]:text-[13px] [&_p]:leading-[1.25] [&_p]:font-bold [&_p]:text-[#8b93a3] [&_span]:block [&_span]:text-[13px] [&_span]:leading-[1.25] [&_span]:font-bold [&_span]:text-[#8b93a3]',
  nav: (open: boolean) =>
    cx(
      'grid gap-2 p-4 max-[760px]:grid-cols-2',
      adminStyles.sidebarInner(open),
    ),
  navButton: (active = false) =>
    cx(
      iconSvg,
      'grid min-h-[42px] w-full cursor-pointer grid-cols-[24px_1fr] items-center gap-3 rounded-xl border-0 bg-transparent px-3.5 text-left text-[14px] leading-[1.2] font-bold text-[#3f4758] hover:bg-[#eef5ff] hover:text-[#2f63f4]',
      active && 'bg-[#eef5ff] text-[#2f63f4] [&_svg]:stroke-[2.2]',
    ),
  sidebarFooter: (open: boolean) =>
    cx(
      'mt-auto border-t border-[#e4e7ec] py-4 max-[760px]:border-t-0 max-[760px]:px-[22px] max-[760px]:pt-0 max-[760px]:pb-[18px]',
      adminStyles.sidebarInner(open),
    ),
  footerButton:
    iconSvg +
    ' grid min-h-[42px] w-full cursor-pointer grid-cols-[24px_1fr] items-center gap-3 rounded-xl border-0 bg-transparent px-7 text-left text-[14px] leading-[1.2] font-bold text-[#3f4758] hover:bg-[#eef5ff] hover:text-[#2f63f4] max-[760px]:px-[18px]',
  main: 'min-w-0 bg-[#f8f9fb]',
  topbar: (open: boolean) =>
    cx(
      iconSvg,
      'box-border flex h-16 items-center justify-between border-b border-[#e4e7ec] bg-white px-10 transition-[height,padding] duration-[260ms] max-[760px]:h-[72px] max-[760px]:px-[22px]',
      !open && 'px-7 pl-9 max-[760px]:px-[22px]',
    ),
  iconButton:
    'grid h-[34px] w-[34px] cursor-pointer place-items-center border-0 bg-transparent p-0 text-[#111827] transition-transform duration-180 hover:scale-[1.04] [&_svg]:h-6 [&_svg]:w-6',
  languageButton:
    iconSvg +
    ' inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-[#f4f6fa] px-[13px] py-2 text-[14px] leading-none font-extrabold text-[#111827] hover:bg-[#eef2f7] [&_svg]:h-[19px] [&_svg]:w-[19px]',
  content: (open: boolean) =>
    cx('p-[30px_28px] transition-[padding] duration-[260ms] max-[760px]:p-[28px_22px]', !open && 'p-[30px_28px] max-[760px]:p-[28px_22px]'),
  heading:
    'mb-6 flex min-h-[46px] items-start justify-between gap-6 max-[760px]:flex-col max-[760px]:items-stretch [&_h2]:m-0 [&_h2]:text-[26px] [&_h2]:leading-none [&_h2]:font-extrabold [&_h2]:text-[#111]',
  createButton:
    'inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-[#315af2] px-5 text-[17px] leading-none font-extrabold text-white shadow-[0_4px_10px_rgba(49,90,242,0.18)] hover:bg-[#254be0] max-[760px]:w-full max-[760px]:justify-center max-[760px]:text-[18px] [&_span]:text-[22px] [&_span]:leading-none [&_span]:font-normal',
  message: 'mt-[-8px] mb-[18px] text-[15px] font-bold',
  emptyState:
    panel +
    ' grid min-h-[185px] place-items-center rounded-xl shadow-[0_3px_7px_rgba(17,24,39,0.1)]',
  emptyContent:
    iconSvg +
    ' grid justify-items-center gap-4 text-[16px] font-medium text-[#6b7280] [&_svg]:h-[46px] [&_svg]:w-[46px] [&_svg]:stroke-[#d1d5db] [&_svg]:stroke-[1.9]',
  statsGrid: (open: boolean) =>
    cx(
      'grid grid-cols-4 gap-[22px] transition-[grid-template-columns,gap] duration-[260ms] max-[1180px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-[18px]',
      !open && 'grid-cols-4 gap-7 max-[1180px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-[18px]',
    ),
  statCard:
    panel +
    ' box-border flex min-h-[104px] items-center justify-between gap-[18px] rounded-xl p-[22px] shadow-[0_3px_7px_rgba(17,24,39,0.1)] [&_p]:mb-3.5 [&_p]:text-[16px] [&_p]:leading-none [&_p]:font-bold [&_p]:text-[#5b6576] [&_strong]:block [&_strong]:text-[32px] [&_strong]:leading-none [&_strong]:font-medium [&_strong]:text-[#050505]',
  statIcon: (tone: string) =>
    cx(
      iconSvg,
      'grid h-[50px] w-[50px] shrink-0 place-items-center rounded-[14px]',
      tone === 'blue' && 'bg-[#dfeaff] text-[#315af2]',
      tone === 'purple' && 'bg-[#f0e4ff] text-[#8b3ff2]',
      tone === 'green' && 'bg-[#dcf9e6] text-[#2ea95a]',
      tone === 'orange' && 'bg-[#fff0dc] text-[#ea5a0c]',
    ),
  tableCard:
    panel +
    ' overflow-hidden rounded-xl max-[760px]:overflow-x-auto',
  table: (kind: string) =>
    cx(
      'w-full max-[760px]:min-w-[720px]',
      (kind === 'archivedTasks' || kind === 'archivedTeams') && 'max-[760px]:min-w-[860px]',
    ),
  search:
    iconSvg +
    ' relative border-b border-[#edf0f4] px-4 pt-4 pb-3.5 [&_svg]:absolute [&_svg]:left-[30px] [&_svg]:top-1/2 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:-translate-y-1/2 [&_svg]:stroke-[#9aa3b2] [&_input]:box-border [&_input]:h-[46px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd6e0] [&_input]:bg-white [&_input]:pr-4 [&_input]:pl-[46px] [&_input]:text-[17px] [&_input]:leading-none [&_input]:text-[#111827] [&_input]:placeholder:text-[#7b8190] [&_input]:focus:border-[#aeb8ce] [&_input]:focus:outline-[3px] [&_input]:focus:outline-[rgba(49,90,242,0.14)]',
  rowCols: (kind: string) =>
    cx(
      kind === 'users' && 'grid-cols-[1.05fr_1.05fr_1fr_0.2fr]',
<<<<<<< HEAD
      kind === 'managers' && 'grid-cols-[1fr_1fr_1fr_0.2fr]',
=======
      kind === 'managers' && 'grid-cols-[1fr_1fr_0.7fr_0.35fr]',
>>>>>>> 10521186f908ef3f3095530bdadbb964ee0f304b
      kind === 'archivedTasks' && 'grid-cols-[1.35fr_1fr_1fr_0.55fr_0.45fr]',
      kind === 'archivedTeams' && 'grid-cols-[1.35fr_1fr_0.55fr_0.55fr_0.45fr]',
      kind === 'logs' && 'grid-cols-[1fr_1fr_1fr_0.6fr]',
    ),
  head: (kind: string) =>
    cx(
      adminStyles.rowCols(kind),
      'grid min-h-11 items-center border-b border-[#edf0f4] bg-white px-7 text-[13px] font-extrabold tracking-[0.02em] text-[#6b7280] shadow-[0_3px_6px_rgba(17,24,39,0.08)] [&_span:last-child]:text-right',
    ),
  bodyRow: (kind: string) =>
    cx(
      adminStyles.rowCols(kind),
      'grid min-h-[52px] items-center border-b border-[#edf0f4] px-7 text-[15px] font-semibold text-[#111827] [&_span]:min-w-0 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span:last-child]:text-right',
    ),
  tableEmpty: 'px-7 py-[22px] text-[15px] font-bold text-[#6b7280]',
  tableAction:
    'min-h-8 cursor-pointer rounded-lg border border-[#cfd6e0] bg-white px-3 text-[13px] leading-none font-extrabold text-[#315af2] hover:bg-[#eef5ff]',
  archiveActions: 'inline-flex items-center justify-end gap-2.5',
<<<<<<< HEAD
  iconAction: (tone: 'recover' | 'delete') =>
    cx(
      iconSvg,
      'inline-grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border-0 bg-transparent p-0 hover:not-disabled:bg-[#f3f6fa] disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:h-[18px] [&_svg]:w-[18px]',
      tone === 'recover' ? 'text-[#16a34a]' : 'text-[#ef1d32]',
=======
  iconAction: (tone: 'recover' | 'delete' | 'edit') =>
    cx(
      iconSvg,
      'inline-grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border-0 bg-transparent p-0 hover:not-disabled:bg-[#f3f6fa] disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:h-[18px] [&_svg]:w-[18px]',
      tone === 'recover' && 'text-[#16a34a]',
      tone === 'edit' && 'text-[#315af2]',
      tone === 'delete' && 'text-[#ef1d32]',
>>>>>>> 10521186f908ef3f3095530bdadbb964ee0f304b
    ),
  logsPanel: 'relative',
  logsFilter:
    'absolute top-[-78px] right-1 min-h-[106px] w-[184px] rounded-xl border border-white/15 bg-white px-4 py-2.5 text-[17px] leading-[1.35] text-black shadow-[0_12px_26px_rgba(17,24,39,0.3)] focus:outline-[3px] focus:outline-[rgba(49,90,242,0.24)] max-[760px]:static max-[760px]:mb-4 max-[760px]:min-h-12 max-[760px]:w-full max-[760px]:text-[#111827] max-[760px]:shadow-none',
  modalBackdrop:
    'fixed inset-0 z-20 grid place-items-center bg-black/94 p-8 max-[760px]:p-5',
  modal:
    'box-border w-[min(100%,520px)] rounded-[10px] bg-white p-7 max-[760px]:px-[22px] [&_h2]:mb-6 [&_h2]:text-[24px] [&_h2]:leading-[1.15] [&_h2]:font-extrabold [&_h2]:text-[#111] [&_label]:mb-[18px] [&_label]:grid [&_label]:gap-2 [&_label_span]:text-[16px] [&_label_span]:leading-[1.2] [&_label_span]:font-extrabold [&_label_span]:text-[#111] [&_input]:min-h-[46px] [&_input]:w-full [&_input]:box-border [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd6e0] [&_input]:bg-white [&_input]:px-3 [&_input]:text-[17px] [&_input]:leading-none [&_input]:text-[#111827] [&_select]:min-h-[30px] [&_select]:w-full [&_select]:box-border [&_select]:rounded [&_select]:border [&_select]:border-[#cfd6e0] [&_select]:bg-white [&_select]:px-3 [&_select]:text-[17px] [&_select]:leading-none [&_select]:text-[#111827] [&_input:focus]:border-[#aeb8ce] [&_input:focus]:outline-[3px] [&_input:focus]:outline-[rgba(49,90,242,0.14)] [&_select:focus]:border-[#aeb8ce] [&_select:focus]:outline-[3px] [&_select:focus]:outline-[rgba(49,90,242,0.14)]',
  modalActions:
    'mt-0.5 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1 [&_button]:min-h-12 [&_button]:cursor-pointer [&_button]:rounded-[10px] [&_button]:text-[17px] [&_button]:leading-none [&_button]:font-extrabold [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-72',
  modalCancel: 'border border-[#cfd6e0] bg-white text-[#111]',
  modalSave: 'border border-[#315af2] bg-[#315af2] text-white hover:bg-[#254be0]',
}

export const managerStyles = {
  shell: (open: boolean) =>
    cx(
      'grid min-h-[100svh] bg-[#f8f9fb] font-[Arial,sans-serif] text-left text-[#111827] transition-[grid-template-columns] duration-[260ms]',
      open ? 'grid-cols-[255px_1fr] max-[1180px]:grid-cols-[235px_1fr] max-[760px]:grid-cols-1' : 'grid-cols-[0_1fr] max-[760px]:grid-cols-1',
    ),
  sidebar: (open: boolean) =>
    cx(
      'flex min-h-[100svh] flex-col overflow-hidden border-r border-[#e4e7ec] bg-white transition-[opacity,transform,border-color,max-height] duration-[260ms] max-[760px]:min-h-0 max-[760px]:border-r-0',
      open
        ? 'opacity-100 translate-x-0 max-[760px]:max-h-[520px]'
        : 'pointer-events-none -translate-x-6 border-r-transparent opacity-0 max-[760px]:max-h-0 max-[760px]:-translate-y-3 max-[760px]:translate-x-0',
    ),
  sidebarInner: (open: boolean) =>
    cx('min-w-[255px] transition-opacity duration-180 max-[1180px]:min-w-[235px]', !open && 'opacity-0'),
  brand:
    'border-b border-[#e4e7ec] px-4 pt-5 pb-[18px] max-[760px]:p-[22px] [&_h1]:mb-2 [&_h1]:text-[22px] [&_h1]:leading-none [&_h1]:font-extrabold [&_h1]:text-[#2f63f4] [&_p]:block [&_p]:text-[13px] [&_p]:leading-[1.25] [&_p]:font-bold [&_p]:text-[#8b93a3] [&_span]:block [&_span]:text-[13px] [&_span]:leading-[1.25] [&_span]:font-bold [&_span]:text-[#8b93a3]',
  nav: (open: boolean) =>
    cx('grid gap-2 p-[18px_16px] max-[760px]:grid-cols-2', managerStyles.sidebarInner(open)),
  navButton: (active = false) =>
    cx(
      iconSvg,
      'grid min-h-[42px] w-full cursor-pointer grid-cols-[24px_1fr] items-center gap-3 rounded-lg border-0 bg-transparent px-3.5 text-left text-[14px] leading-[1.2] font-bold text-[#263247] hover:bg-[#eef5ff] hover:text-[#315af2] [&_svg]:h-[21px] [&_svg]:w-[21px]',
      active && 'bg-[#eef5ff] text-[#315af2]',
    ),
  sidebarFooter: (open: boolean) =>
    cx('mt-auto border-t border-[#e4e7ec] py-[18px] max-[760px]:border-t-0 max-[760px]:px-[22px] max-[760px]:pt-0 max-[760px]:pb-[18px]', managerStyles.sidebarInner(open)),
  footerButton:
    iconSvg +
    ' grid min-h-[42px] w-full cursor-pointer grid-cols-[24px_1fr] items-center gap-3 rounded-lg border-0 bg-transparent px-[22px] text-left text-[14px] leading-[1.2] font-bold text-[#263247] hover:bg-[#eef5ff] hover:text-[#315af2] max-[760px]:px-[18px] [&_svg]:h-[21px] [&_svg]:w-[21px]',
  main: 'min-w-0 bg-[#f8f9fb]',
  topbar: (open: boolean) =>
    cx(iconSvg, 'box-border flex h-[65px] items-center justify-between border-b border-[#e4e7ec] bg-white px-8 max-[760px]:h-[72px] max-[760px]:px-[22px]', !open && 'pl-9 max-[760px]:px-[22px]'),
  iconButton: 'grid h-[34px] w-[34px] cursor-pointer place-items-center border-0 bg-transparent p-0 text-[#111827] [&_svg]:h-6 [&_svg]:w-6',
  languageButton:
    iconSvg +
    ' inline-flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-[13px] py-2 text-[14px] leading-none font-extrabold text-[#111827] hover:bg-[#f2f5fa] [&_svg]:h-[19px] [&_svg]:w-[19px]',
  content: 'p-[34px_24px_40px] max-[760px]:p-[28px_22px]',
  heading:
    'mb-7 flex min-h-12 items-start justify-between gap-6 max-[760px]:mb-5 max-[760px]:flex-col max-[760px]:items-stretch [&_h2]:m-0 [&_h2]:text-[25px] [&_h2]:leading-[1.1] [&_h2]:font-extrabold [&_h2]:text-[#050505]',
  createButton:
    iconSvg +
    ' inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border-0 bg-[#315af2] px-4 text-[16px] leading-none font-extrabold text-white hover:bg-[#254be0] max-[760px]:w-full max-[760px]:justify-center [&_svg]:h-[18px] [&_svg]:w-[18px]',
  message: 'mt-[-12px] mb-[18px] text-[15px] font-bold',
  statsGrid: 'mb-[22px] grid grid-cols-4 gap-[22px] max-[1180px]:grid-cols-2 max-[760px]:grid-cols-1 max-[760px]:gap-[18px]',
  statCard:
    panel +
    ' box-border min-h-28 rounded-[10px] p-[28px_24px] shadow-[0_3px_7px_rgba(17,24,39,0.1)] [&_p]:mb-4 [&_p]:text-[15px] [&_p]:leading-none [&_p]:font-medium [&_p]:text-[#25324a] [&_strong]:block [&_strong]:min-h-8 [&_strong]:text-[32px] [&_strong]:leading-none [&_strong]:font-medium [&_strong]:text-black',
  dashboardPanel:
    panel +
    ' rounded-[10px] p-[28px_24px_24px] [&_h3]:mb-[18px] [&_h3]:text-[21px] [&_h3]:leading-none [&_h3]:font-extrabold [&_h3]:text-[#050505]',
  emptyText: 'text-[14px] leading-[1.35] font-medium text-[#25324a]',
  teamList: 'grid gap-3',
  dashboardTeam:
    'box-border flex min-h-[82px] items-center justify-between gap-[18px] rounded-lg border border-[#dfe4ec] p-4 max-[760px]:flex-col max-[760px]:items-start [&_h4]:mb-2 [&_h4]:text-[16px] [&_h4]:leading-[1.2] [&_h4]:font-extrabold [&_h4]:text-[#050505] [&_p]:text-[14px] [&_p]:leading-[1.35] [&_p]:font-medium [&_p]:text-[#25324a] [&_span]:whitespace-nowrap [&_span]:text-[14px] [&_span]:font-medium [&_span]:text-[#4f5b72] max-[760px]:[&_span]:whitespace-normal',
  filters:
    'mb-6 flex flex-wrap gap-3 [&_select]:h-[42px] [&_select]:min-w-[214px] [&_select]:rounded-lg [&_select]:border [&_select]:border-[#cfd6e0] [&_select]:bg-white [&_select]:px-[18px] [&_select]:text-[16px] [&_select]:leading-none [&_select]:text-[#050505] max-[760px]:[&_select]:w-full',
  backendWarning:
    iconSvg +
    ' mb-[18px] mt-[-10px] inline-flex items-center gap-2 text-[13px] leading-[1.35] font-bold text-[#ef1d32] [&_svg]:h-4 [&_svg]:w-4',
  kanban: 'grid grid-cols-4 items-start gap-4 overflow-visible pb-1 max-[1180px]:grid-cols-2 max-[760px]:grid-cols-1',
  kanbanColumn: (id: string) =>
    cx(
      'overflow-visible rounded-[14px] border-2 border-[#d1d5db] bg-[#f8f9fc]',
      id === 'inprogress' && 'border-[#86b7ff] bg-[#eef6ff]',
      id === 'review' && 'border-[#facc15] bg-[#fffde8]',
      id === 'done' && 'border-[#75e59b] bg-[#effdf4]',
    ),
  kanbanHeader: 'box-border min-h-[70px] border-b border-[rgba(17,24,39,0.13)] p-[18px_16px] [&_h3]:mb-2 [&_h3]:text-[14px] [&_h3]:leading-none [&_h3]:font-extrabold [&_h3]:text-[#050505] [&_span]:text-[13px] [&_span]:font-medium [&_span]:text-[#25324a]',
  kanbanList: 'flex flex-col gap-4 p-4',
  taskCard: (selected = false) =>
    cx(
      panel,
      'grid min-h-[120px] cursor-pointer gap-2.5 rounded-lg p-4 shadow-[0_3px_7px_rgba(17,24,39,0.1)] transition-[transform,box-shadow,border-color] duration-180 hover:-translate-y-px hover:shadow-[0_8px_18px_rgba(17,24,39,0.14)]',
      selected && 'border-[#315af2] shadow-[0_12px_28px_rgba(49,90,242,0.16)]',
    ),
  taskCardTitle:
    'flex items-start justify-between gap-3 [&_h4]:line-clamp-2 [&_h4]:text-[16px] [&_h4]:leading-[1.25] [&_h4]:font-extrabold [&_h4]:text-[#050505]',
  taskDescription: 'line-clamp-2 min-h-[34px] text-[13px] font-medium text-[#25324a]',
  cardBadges: 'inline-flex items-center gap-1.5',
  cardWarning: iconSvg + ' inline-grid h-[18px] w-[18px] place-items-center text-[#ef1d32] [&_svg]:h-4 [&_svg]:w-4',
  taskMeta:
    iconSvg +
    ' grid grid-cols-[0.5fr_1fr_0.5fr] items-center gap-2 text-[13px] font-medium text-[#6b7280] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[5px] [&_span]:whitespace-nowrap [&_span:nth-child(2)]:justify-center [&_span:last-child]:justify-end [&_svg]:h-[15px] [&_svg]:w-[15px]',
  missing: 'text-[#ef1d32]',
  calendarPanel:
    panel +
    ' rounded-[10px] p-[28px_24px_24px]',
  calendarHeader: 'mb-5 flex items-center justify-between gap-4',
  calendarLabel: 'mb-1.5 text-[12px] font-normal tracking-[0.08em] text-[#4f5b72] uppercase',
  calendarActions: 'flex flex-wrap gap-2.5',
  calendarNav: 'min-h-9 cursor-pointer rounded-full border border-[#d1d5db] bg-white px-3.5 text-[13px] leading-none font-bold text-[#1f2937]',
  calendarToggle: (active = false) =>
    cx('min-h-9 cursor-pointer rounded-full border border-[#d1d5db] bg-white px-3.5 text-[13px] leading-none font-bold text-[#1f2937]', active && 'border-[#315af2] bg-[#315af2] text-white'),
  calendarGrid: 'grid grid-cols-7 gap-2.5',
  calendarWeekday: 'border-b border-[#e5e7eb] px-3 py-2.5 text-[13px] font-bold text-[#4b5563] uppercase',
  calendarDay: (outside: boolean, today: boolean) =>
    cx('flex min-h-[110px] flex-col gap-2.5 rounded-xl border border-[#edf0f4] bg-white p-3', outside && 'bg-[#f8fafc] opacity-55', today && 'border-[#315af2] shadow-[0_0_0_1px_rgba(49,90,242,0.12)]'),
  calendarDayNumber: 'font-bold text-[#0f172a]',
  calendarDayTasks: 'grid gap-1.5',
  calendarTaskPill: (more = false) =>
    cx('block overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2 py-1.5 text-[12px] font-bold', more ? 'bg-[#e2e8f0] text-[#475569]' : 'bg-[#eff6ff] text-[#1d4ed8]'),
  teamsPanel: 'grid gap-3.5',
  teamCard:
    panel +
    ' rounded-[10px] p-[28px_24px]',
  teamCardMain: 'flex min-h-[58px] items-center justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start [&_h3]:mb-2.5 [&_h3]:text-[18px] [&_h3]:leading-[1.2] [&_h3]:font-extrabold [&_h3]:text-[#050505] [&_p]:text-[14px] [&_p]:leading-[1.35] [&_p]:font-medium [&_p]:text-[#25324a]',
  teamActions: iconSvg + ' flex flex-wrap justify-end gap-2.5 max-[760px]:justify-start [&_button]:inline-flex [&_button]:min-h-[30px] [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-1 [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0 [&_button]:text-[14px] [&_button]:leading-none [&_button]:font-bold [&_button]:text-[#315af2] [&_button:hover]:underline [&_svg]:h-[15px] [&_svg]:w-[15px]',
  teamDetails: 'mt-[18px] border-t border-[#edf0f4] pt-6',
  detailSection: iconSvg + ' mb-6 grid gap-3.5 last:mb-0 [&_h4]:mb-2.5 [&_h4]:inline-flex [&_h4]:items-center [&_h4]:gap-2 [&_h4]:text-[15px] [&_h4]:font-extrabold [&_h4]:text-[#050505] [&_h4_svg]:h-[18px] [&_h4_svg]:w-[18px] [&_p]:text-[13px] [&_p]:leading-[1.35] [&_p]:text-[#25324a]',
  memberGrid: 'grid grid-cols-3 gap-3 max-[760px]:grid-cols-1',
  memberChip: 'inline-flex min-h-14 items-center gap-2.5 rounded-lg bg-[#f8fafc] px-3.5 text-[14px] font-semibold text-[#111827]',
  detailTaskList: 'grid gap-2',
  detailTask: 'rounded-lg border border-[#dfe4ec] bg-white p-4',
  detailTaskHeader: 'mb-2.5 flex items-start justify-between gap-4 [&_h5]:text-[15px] [&_h5]:leading-[1.25] [&_h5]:font-bold [&_h5]:text-[#050505] [&>span]:inline-flex [&>span]:gap-2',
  detailTaskMeta: iconSvg + ' mt-3 grid grid-cols-3 gap-3 border-b border-[#edf0f4] pb-2.5 text-[13px] text-[#6b7280] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[5px] [&_span:nth-child(2)]:justify-center [&_span:last-child]:justify-end [&_svg]:h-3.5 [&_svg]:w-3.5',
  assigneeList: 'mt-2.5 flex flex-wrap gap-1.5 [&_span]:rounded [&_span]:bg-[#eef5ff] [&_span]:px-2 [&_span]:py-1 [&_span]:text-[12px] [&_span]:font-semibold [&_span]:text-[#315af2]',
  modalBackdrop:
<<<<<<< HEAD
    'fixed inset-0 z-30 grid overflow-y-auto bg-black/96 p-[22px_28px] max-[760px]:p-5 [place-items:start_center]',
=======
    'fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-black/96 p-[22px_28px] max-[760px]:p-5',
>>>>>>> 10521186f908ef3f3095530bdadbb964ee0f304b
  modal:
    'box-border w-[min(100%,672px)] rounded-lg bg-white p-[28px_24px_24px] max-[760px]:p-[26px_22px] [&_h2]:mb-[22px] [&_h2]:text-[21px] [&_h2]:leading-[1.2] [&_h2]:font-extrabold [&_h2]:text-[#050505] [&_label]:mb-[18px] [&_label]:grid [&_label]:gap-2 [&_label_span]:text-[14px] [&_label_span]:leading-[1.2] [&_label_span]:font-extrabold [&_label_span]:text-[#050505] [&_input]:box-border [&_input]:min-h-[42px] [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-[#cfd6e0] [&_input]:bg-white [&_input]:px-4 [&_input]:text-[16px] [&_input]:leading-[1.2] [&_input]:text-[#111827] [&_input:focus]:border-[#aeb8ce] [&_input:focus]:outline-[3px] [&_input:focus]:outline-[rgba(49,90,242,0.14)] [&_select]:box-border [&_select]:min-h-[42px] [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-[#cfd6e0] [&_select]:bg-white [&_select]:px-4 [&_select]:text-[16px] [&_select]:leading-[1.2] [&_select]:text-[#111827] [&_select:focus]:border-[#aeb8ce] [&_select:focus]:outline-[3px] [&_select:focus]:outline-[rgba(49,90,242,0.14)] [&_textarea]:w-full [&_textarea]:box-border [&_textarea]:min-h-[114px] [&_textarea]:resize-y [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-[#cfd6e0] [&_textarea]:bg-white [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-[16px] [&_textarea]:leading-[1.2] [&_textarea]:text-[#111827] [&_textarea:focus]:border-[#aeb8ce] [&_textarea:focus]:outline-[3px] [&_textarea:focus]:outline-[rgba(49,90,242,0.14)]',
  modalActions:
    'grid grid-cols-2 gap-3 max-[760px]:grid-cols-1 [&_button]:min-h-[42px] [&_button]:cursor-pointer [&_button]:rounded-[9px] [&_button]:text-[16px] [&_button]:leading-none [&_button]:font-extrabold [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-72',
  modalCancel: 'border border-[#cfd6e0] bg-white text-[#050505]',
  modalSave: 'border border-[#315af2] bg-[#315af2] text-white hover:bg-[#254be0]',
  modalDanger: 'border border-[#ef1d32] bg-[#ef1d32] text-white hover:not-disabled:bg-[#dc1025]',
  modalGrid: 'grid grid-cols-2 gap-4 max-[760px]:grid-cols-1',
  checkboxPanel:
<<<<<<< HEAD
    'mb-4 grid max-h-40 gap-2 overflow-y-auto rounded-[10px] border border-[#dfe4ec] p-[14px_16px] [&_legend]:text-[14px] [&_legend]:leading-[1.2] [&_legend]:font-extrabold [&_legend]:text-[#050505] [&_label]:m-0 [&_label]:flex [&_label]:min-h-7 [&_label]:items-center [&_label]:gap-2 [&_label]:text-[14px] [&_label]:font-bold [&_label]:text-[#25324a] [&_input]:h-3.5 [&_input]:min-h-3.5 [&_input]:w-3.5 [&_input]:shrink-0 [&_input]:p-0 [&_p]:text-[14px] [&_p]:font-semibold [&_p]:text-[#6b7280]',
=======
    'mb-4 rounded-[14px] border border-[#dfe4ec] bg-[#f8fafc] p-4',
  checkboxGrid: 'grid grid-cols-2 gap-3 max-[760px]:grid-cols-1',
  checkboxOption:
    'grid gap-3 rounded-[14px] border border-[#dfe4ec] bg-white p-4 transition duration-200 hover:border-[#315af2] focus-within:border-[#315af2] [&_input]:mt-1 [&_span]:text-[15px] [&_span]:font-semibold [&_span]:text-[#111827]',
  checkboxOptionSelected: 'border-[#315af2] bg-[#eef5ff]',
>>>>>>> 10521186f908ef3f3095530bdadbb964ee0f304b
  checkboxPanelTall: 'max-h-60',
  taskDetailModal:
    'grid max-h-[74svh] w-[min(100%,896px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 max-[760px]:max-h-[90svh]',
  taskDetailHead:
    iconSvg +
    ' flex items-start justify-between gap-6 border-b border-[#e4e7ec] p-[28px_24px_24px] max-[760px]:px-5 [&_p]:mt-2.5 [&_p]:text-[14px] [&_p]:font-medium [&_p]:text-[#25324a]',
  taskDetailTitleRow: 'flex flex-wrap items-center gap-2.5 [&_h2]:m-0',
  taskDetailClose: iconSvg + ' grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[#111827] hover:bg-[#f3f6fa] [&_svg]:h-[22px] [&_svg]:w-[22px]',
  taskDetailBody: 'overflow-y-auto p-[26px_24px_20px] max-[760px]:px-5',
  taskSummary: 'grid gap-3.5 pb-6 [&_h3]:text-[14px] [&_h3]:font-extrabold [&_h3]:text-[#050505] [&_p]:text-[16px] [&_p]:leading-[1.55] [&_p]:text-[#172033]',
  taskFacts: iconSvg + ' grid grid-cols-2 gap-[18px] text-[14px] text-[#25324a] max-[760px]:grid-cols-1 [&_span]:inline-flex [&_span]:items-center [&_span]:gap-2 [&_svg]:h-[17px] [&_svg]:w-[17px]',
  taskAssignees: iconSvg + ' grid gap-3.5 border-b border-[#e4e7ec] pb-6 [&>div:first-child]:flex [&>div:first-child]:items-center [&>div:first-child]:justify-between [&>div:first-child]:gap-[18px] [&_h3]:text-[14px] [&_h3]:font-extrabold [&_h3]:text-[#050505] [&_button]:inline-flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[14px] [&_button]:leading-none [&_button]:font-bold [&_button]:text-[#315af2] [&_button_svg]:h-[17px] [&_button_svg]:w-[17px]',
  taskAssigneeChips: 'flex flex-wrap gap-2.5 [&>span]:inline-flex [&>span]:min-h-[34px] [&>span]:items-center [&>span]:gap-2 [&>span]:rounded-full [&>span]:bg-[#f3f4f6] [&>span]:px-3 [&>span]:text-[14px] [&>span]:font-semibold [&>span]:text-[#111827]',
  taskTabs: 'flex flex-wrap gap-2.5 p-[26px_0_16px]',
  taskTab: (active = false) => cx('inline-flex min-h-10 cursor-pointer items-center rounded-lg border-0 bg-transparent px-4 text-[16px] leading-none font-extrabold text-[#25324a]', active && 'bg-[#dbeafe] text-[#315af2]'),
  taskTabPanel: 'grid gap-3.5 [&_textarea]:box-border [&_textarea]:min-h-[90px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#cfd6e0] [&_textarea]:bg-white [&_textarea]:p-3.5 [&_textarea]:text-[16px] [&_textarea]:leading-[1.35] [&_textarea]:text-[#111827]',
  commentActions: 'flex items-center justify-between gap-[18px] max-[760px]:flex-col max-[760px]:items-stretch [&_span]:text-[12px] [&_span]:text-[#4f5b72] [&_button]:min-h-10 [&_button]:cursor-pointer [&_button]:rounded-lg [&_button]:border-0 [&_button]:bg-[#0f5bff] [&_button]:px-[18px] [&_button]:text-[16px] [&_button]:leading-none [&_button]:font-extrabold [&_button]:text-white',
  commentList: 'grid gap-3 [&_article]:flex [&_article]:gap-3 [&_article]:rounded-lg [&_article]:bg-[#f8fafc] [&_article]:p-4 [&_strong]:block [&_strong]:text-[14px] [&_strong]:text-[#111827] [&_time]:text-[12px] [&_time]:text-[#6b7280] [&_p]:mt-2 [&_p]:text-[14px] [&_p]:leading-[1.45] [&_p]:text-[#172033]',
  taskRecord: 'grid grid-cols-[1fr_auto_auto] items-center gap-3.5 rounded-lg bg-[#f8fafc] p-[14px_16px] max-[760px]:grid-cols-1 [&_strong]:block [&_strong]:text-[14px] [&_strong]:text-[#111827] [&_span]:text-[12px] [&_span]:text-[#6b7280] [&_time]:text-[12px] [&_time]:text-[#6b7280]',
  taskDetailFooter: 'flex min-h-[88px] items-center justify-between gap-5 border-t border-[#e4e7ec] bg-white px-[38px] max-[760px]:h-auto max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:p-[18px_20px] [&_button]:min-h-10 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[16px] [&_button]:leading-none [&_button]:font-extrabold [&_button]:text-[#0f5bff]',
  endpointNote: 'mt-4 text-[13px] text-[#b45309]',
  taskDetailsPanel: panel + ' mt-6 rounded-2xl border-[#d9e2f5] p-6 shadow-[0_8px_24px_rgba(17,24,39,0.05)]',
}
