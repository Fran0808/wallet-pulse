package com.financemanager.listener.parser

interface NotificationParser {
    val supportedPackages: Set<String>

    fun canHandle(packageName: String): Boolean {
        return supportedPackages.contains(packageName)
    }

    fun parse(title: String?, text: String?, bigText: String? = null): ParsedTransaction?
}
