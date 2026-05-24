using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
namespace TaskManagementSystem.Modules.Notification.Application.Dto_s
{
    public class NotificationDto
    {
        public int Id { get; set; }

        public string Message { get; set; } = string.Empty;

        public Status Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public bool IsRead { get; set; }
    }
}
