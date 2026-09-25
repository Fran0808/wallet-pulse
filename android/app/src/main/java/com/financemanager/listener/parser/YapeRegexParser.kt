package com.financemanager.listener.parser

object YapeRegexParser : YapeNotificationParser() {
    fun isYapeNotification(packageName: String?): Boolean {
        return canHandle(packageName ?: "")
    }
}