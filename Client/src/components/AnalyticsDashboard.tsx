import { useEffect, useRef } from 'react'
import type { ManagerTeamDto, ManagerTaskCardDto } from '../api/managerApi'

// Declare Chart.js global type
declare global {
  interface Window {
    Chart: any
  }
}

type AnalyticsDashboardProps = {
  teams: ManagerTeamDto[]
  boardTasks: (ManagerTaskCardDto & { teamId: number; teamName: string })[]
}

function statusColumn(status: string): 'todo' | 'inprogress' | 'review' | 'done' {
  const normalized = status.replace(/[\s_-]/g, '').toLowerCase()

  if (normalized === 'done') return 'done'
  if (normalized === 'requestedcompletion' || normalized === 'review') {
    return 'review'
  }

  if (status.startsWith('local:')) {
    const localStatus = status.replace('local:', '') as 'todo' | 'inprogress' | 'review' | 'done'
    if (['todo', 'inprogress', 'review', 'done'].includes(localStatus)) {
      return localStatus
    }
    return 'todo'
  }

  if (
    normalized === 'inprogress' ||
    normalized === 'doing' ||
    normalized === 'active'
  ) {
    return 'inprogress'
  }

  return 'todo'
}

function priorityLabel(priority: string): string {
  const normalized = priority.toLowerCase()
  if (normalized === 'high' || normalized === '3') return 'High'
  if (normalized === 'low' || normalized === '1') return 'Low'
  return 'Medium'
}

function priorityTone(priority: string): string {
  return priorityLabel(priority).toLowerCase()
}

export default function AnalyticsDashboard({
  teams,
  boardTasks,
}: AnalyticsDashboardProps) {
  const statusChartRef = useRef<HTMLCanvasElement>(null)
  const priorityChartRef = useRef<HTMLCanvasElement>(null)
  const teamPerformanceChartRef = useRef<HTMLCanvasElement>(null)
  const workHoursChartRef = useRef<HTMLCanvasElement>(null)
  const tasksByStatusChartRef = useRef<HTMLCanvasElement>(null)

  const statusChartInstanceRef = useRef<any>(null)
  const priorityChartInstanceRef = useRef<any>(null)
  const teamPerformanceChartInstanceRef = useRef<any>(null)
  const workHoursChartInstanceRef = useRef<any>(null)
  const tasksByStatusChartInstanceRef = useRef<any>(null)

  // Task Status Distribution
  const statusCounts = {
    todo: boardTasks.filter((t) => statusColumn(t.status) === 'todo').length,
    inprogress: boardTasks.filter((t) => statusColumn(t.status) === 'inprogress').length,
    review: boardTasks.filter((t) => statusColumn(t.status) === 'review').length,
    done: boardTasks.filter((t) => statusColumn(t.status) === 'done').length,
  }

  // Priority Distribution
  const priorityCounts = {
    low: boardTasks.filter((t) => priorityTone(t.priority) === 'low').length,
    medium: boardTasks.filter((t) => priorityTone(t.priority) === 'medium').length,
    high: boardTasks.filter((t) => priorityTone(t.priority) === 'high').length,
  }

  // Team Performance (Tasks per team)
  const teamPerformanceData = teams.map((team) => ({
    name: team.name,
    totalTasks: team.tasksCount || 0,
  }))

  // Work Hours by Team
  const workHoursByTeam = teams.map((team) => {
    const teamTasks = boardTasks.filter((t) => t.teamId === team.id)
    const totalHours = teamTasks.reduce((sum, task) => sum + (task.workHours || 0), 0)
    return {
      name: team.name,
      hours: totalHours,
    }
  })

  // Tasks by Status per Team
  const tasksByStatusPerTeam = teams.map((team) => {
    const teamTasks = boardTasks.filter((t) => t.teamId === team.id)
    return {
      name: team.name,
      todo: teamTasks.filter((t) => statusColumn(t.status) === 'todo').length,
      inprogress: teamTasks.filter((t) => statusColumn(t.status) === 'inprogress').length,
      review: teamTasks.filter((t) => statusColumn(t.status) === 'review').length,
      done: teamTasks.filter((t) => statusColumn(t.status) === 'done').length,
    }
  })

  // Summary Cards
  const totalTasks = boardTasks.length
  const completedTasks = boardTasks.filter((t) => statusColumn(t.status) === 'done').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const totalWorkHours = boardTasks.reduce((sum, task) => sum + (task.workHours || 0), 0)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Chart) return

    // Destroy existing charts before creating new ones
    if (statusChartInstanceRef.current) {
      statusChartInstanceRef.current.destroy()
    }
    if (priorityChartInstanceRef.current) {
      priorityChartInstanceRef.current.destroy()
    }
    if (teamPerformanceChartInstanceRef.current) {
      teamPerformanceChartInstanceRef.current.destroy()
    }
    if (workHoursChartInstanceRef.current) {
      workHoursChartInstanceRef.current.destroy()
    }
    if (tasksByStatusChartInstanceRef.current) {
      tasksByStatusChartInstanceRef.current.destroy()
    }

    // Status Chart
    if (statusChartRef.current) {
      const ctx = statusChartRef.current.getContext('2d')
      if (ctx) {
        statusChartInstanceRef.current = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['To Do', 'In Progress', 'Review', 'Done'],
            datasets: [{
              data: [statusCounts.todo, statusCounts.inprogress, statusCounts.review, statusCounts.done],
              backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
              borderColor: ['#dc2626', '#d97706', '#2563eb', '#059669'],
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: 'Task Status Distribution',
                font: { size: 16, weight: 'bold' },
              },
            },
          },
        })
      }
    }

    // Priority Chart
    if (priorityChartRef.current) {
      const ctx = priorityChartRef.current.getContext('2d')
      if (ctx) {
        priorityChartInstanceRef.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
              label: 'Number of Tasks',
              data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
              borderColor: ['#059669', '#d97706', '#dc2626'],
              borderWidth: 2,
              borderRadius: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Task Priority Distribution',
                font: { size: 16, weight: 'bold' },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          },
        })
      }
    }

    // Team Performance Chart
    if (teamPerformanceChartRef.current) {
      const ctx = teamPerformanceChartRef.current.getContext('2d')
      if (ctx) {
        teamPerformanceChartInstanceRef.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: teamPerformanceData.map((t) => t.name),
            datasets: [{
              label: 'Total Tasks',
              data: teamPerformanceData.map((t) => t.totalTasks),
              backgroundColor: '#3b82f6',
              borderColor: '#2563eb',
              borderWidth: 2,
              borderRadius: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Tasks per Team',
                font: { size: 16, weight: 'bold' },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          },
        })
      }
    }

    // Work Hours Chart
    if (workHoursChartRef.current) {
      const ctx = workHoursChartRef.current.getContext('2d')
      if (ctx) {
        workHoursChartInstanceRef.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: workHoursByTeam.map((t) => t.name),
            datasets: [{
              label: 'Total Work Hours',
              data: workHoursByTeam.map((t) => t.hours),
              backgroundColor: '#8b5cf6',
              borderColor: '#7c3aed',
              borderWidth: 2,
              borderRadius: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Work Hours by Team',
                font: { size: 16, weight: 'bold' },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    // Tasks by Status Chart
    if (tasksByStatusChartRef.current) {
      const ctx = tasksByStatusChartRef.current.getContext('2d')
      if (ctx) {
        tasksByStatusChartInstanceRef.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: tasksByStatusPerTeam.map((t) => t.name),
            datasets: [
              {
                label: 'To Do',
                data: tasksByStatusPerTeam.map((t) => t.todo),
                backgroundColor: '#ef4444',
                borderRadius: 4,
              },
              {
                label: 'In Progress',
                data: tasksByStatusPerTeam.map((t) => t.inprogress),
                backgroundColor: '#f59e0b',
                borderRadius: 4,
              },
              {
                label: 'Review',
                data: tasksByStatusPerTeam.map((t) => t.review),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
              },
              {
                label: 'Done',
                data: tasksByStatusPerTeam.map((t) => t.done),
                backgroundColor: '#10b981',
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: 'Task Status by Team',
                font: { size: 16, weight: 'bold' },
              },
            },
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          },
        })
      }
    }

    // Cleanup function
    return () => {
      if (statusChartInstanceRef.current) {
        statusChartInstanceRef.current.destroy()
      }
      if (priorityChartInstanceRef.current) {
        priorityChartInstanceRef.current.destroy()
      }
      if (teamPerformanceChartInstanceRef.current) {
        teamPerformanceChartInstanceRef.current.destroy()
      }
      if (workHoursChartInstanceRef.current) {
        workHoursChartInstanceRef.current.destroy()
      }
      if (tasksByStatusChartInstanceRef.current) {
        tasksByStatusChartInstanceRef.current.destroy()
      }
    }
  }, [boardTasks, teams, statusCounts, priorityCounts, teamPerformanceData, workHoursByTeam, tasksByStatusPerTeam])

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalTasks}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{completedTasks}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{completionRate}%</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Work Hours</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">{totalWorkHours}h</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="h-80">
            <canvas ref={statusChartRef} />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="h-80">
            <canvas ref={priorityChartRef} />
          </div>
        </div>

        {/* Team Performance */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="h-80">
            <canvas ref={teamPerformanceChartRef} />
          </div>
        </div>

        {/* Work Hours by Team */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="h-80">
            <canvas ref={workHoursChartRef} />
          </div>
        </div>

        {/* Tasks by Status per Team - Full Width */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2">
          <div className="h-80">
            <canvas ref={tasksByStatusChartRef} />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Team Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const teamTasks = boardTasks.filter((t) => t.teamId === team.id)
            const teamCompleted = teamTasks.filter((t) => statusColumn(t.status) === 'done').length
            const teamRate = teamTasks.length > 0 ? Math.round((teamCompleted / teamTasks.length) * 100) : 0
            const teamHours = teamTasks.reduce((sum, task) => sum + (task.workHours || 0), 0)

            return (
              <div key={team.id} className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900">{team.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Members: {team.employeesCount}</p>
                  <p>Tasks: {teamTasks.length}</p>
                  <p>Completed: {teamCompleted}</p>
                  <p>Completion Rate: {teamRate}%</p>
                  <p>Work Hours: {teamHours}h</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
